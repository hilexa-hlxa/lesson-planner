<?php
declare(strict_types=1);

namespace App;

final class GenerateStream
{
  public static function handle(array $config, ?array $body = null): void
  {
    $groqKey    = (string)($config['groq']['api_key'] ?? '');
    $groqModel  = (string)($config['groq']['model'] ?? 'openai/gpt-oss-120b');
    $geminiKey  = (string)($config['gemini']['api_key'] ?? '');
    $geminiModel = (string)($config['gemini']['model'] ?? 'gemini-2.0-flash');

    // Body: либо передали из index.php, либо читаем сами
    $data = is_array($body) ? $body : [];
    if (!$data) {
      $raw = file_get_contents('php://input') ?: '';
      $tmp = json_decode($raw, true);
      $data = is_array($tmp) ? $tmp : [];
    }

    $prompt = (string)($data['prompt'] ?? '');
    if ($prompt === '') {
      http_response_code(400);
      header('Content-Type: text/plain; charset=utf-8');
      echo "No prompt";
      return;
    }

    // SSE headers
    self::sseHeaders();
    header('X-Accel-Buffering: no');

    // Провайдер выбирается по наличию ключа: Groq в приоритете (быстрее и
    // дешевле для наших промптов), Gemini — запасной, демо-режим — если не
    // настроено вообще ничего.
    //
    // До этого места Gemini был запасным ТОЛЬКО когда Groq-ключ вообще не
    // задан — а не когда он задан, но не работает (просрочен/отозван/невалиден).
    // Обнаружили вживую на проде: Groq отвечал 401 на каждый запрос, а
    // работающий Gemini-ключ рядом простаивал — вся генерация в приложении
    // была недоступна, хотя реальный запасной провайдер существовал.
    //
    // streamGroq()/streamGemini() возвращают bool: true, если клиенту ушёл
    // хоть один дельта-чанк (успех ИЛИ обрыв на середине — тут откатываться
    // на другого провайдера нельзя, SSE-поток не "переиграть" с начала,
    // второй провайдер задублировал бы уже показанный текст). false — сорвался
    // ДО первого чанка (типично — мгновенная HTTP-ошибка вроде 401/429/5xx) и
    // ничего клиенту ещё не отправил, значит можно безопасно попробовать
    // другого провайдера как ни в чём не бывало.
    if ($groqKey !== '') {
      if (self::streamGroq($groqKey, $groqModel, $prompt, $config)) return;

      if ($geminiKey !== '') {
        if (self::streamGemini($geminiKey, $geminiModel, $prompt, $config)) return;
      }

      // Ни один провайдер не выдал ни байта — единственный случай, где
      // handle() сам шлёт 'error'/'done': оба streamXxx() специально молчат,
      // если сорвались ДО первого чанка, чтобы решение "фолбэкнуться или
      // сдаться" принималось в одном месте, а не дублировалось в каждом.
      self::sendEvent(['type' => 'error', 'message' => 'All generation providers unavailable']);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return;
    }

    if ($geminiKey !== '') {
      if (self::streamGemini($geminiKey, $geminiModel, $prompt, $config)) return;

      self::sendEvent(['type' => 'error', 'message' => 'Generation provider unavailable']);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return;
    }

    self::streamDemo();
  }

  // --- [НАЧАЛО ЗАГЛУШКИ] ---
  // Если ни один ключ не задан, включаем режим симуляции
  private static function streamDemo(): void
  {
    // Текст фейкового теста в формате Markdown
    $mockResponse = "## Тест: Веб-разработка (Демо режим)

1. **Что означает аббревиатура HTML?**
   - [ ] Hyper Text Make Link
   - [x] Hyper Text Markup Language
   - [ ] High Tech Modern Language
   - [ ] Home Tool Markup Language

2. **Какой тег используется для создания ссылки?**
   - [x] <a>
   - [ ] <link>
   - [ ] <href>
   - [ ] <url>

3. **Какое свойство CSS меняет цвет текста?**
   - [ ] text-color
   - [ ] font-color
   - [x] color
   - [ ] background-color

4. **Что такое React?**
   - [ ] База данных
   - [ ] Язык программирования
   - [x] JavaScript-библиотека для интерфейсов
   - [ ] Операционная система
";

    // Эмулируем "мышление" ИИ (пауза перед стартом)
    usleep(500000); // 0.5 сек

    // Разбиваем текст на кусочки по 15 символов, чтобы было похоже на печатание
    $chunks = mb_str_split($mockResponse, 15);

    foreach ($chunks as $chunk) {
      self::sendEvent(['type' => 'delta', 'text' => $chunk]);
      self::flushNow();

      // Случайная задержка между "ударами по клавишам" (от 0.03 до 0.1 сек)
      usleep(rand(30000, 100000));
    }

    self::sendEvent(['type' => 'done']);
    self::flushNow();
  }
  // --- [КОНЕЦ ЗАГЛУШКИ] ---

  // Groq — OpenAI-совместимый chat/completions с stream:true. Ответ приходит
  // построчно как "data: {...}\n\n", последняя строка — "data: [DONE]".
  //
  // @return bool true, если клиенту ушёл хоть один дельта-чанк (даже если
  // поток потом оборвался) — вызывающий код тогда не должен пробовать другого
  // провайдера. false, если сорвался до первого чанка и ничего не отправлено:
  // ни 'error', ни 'done' — это специально оставлено вызывающему коду
  // (см. handle()), чтобы решение "фолбэкнуться или сдаться" не дублировалось.
  private static function streamGroq(string $apiKey, string $model, string $prompt, array $config): bool
  {
    $url = 'https://api.groq.com/openai/v1/chat/completions';

    $payload = json_encode([
      'model'    => $model,
      'messages' => [['role' => 'user', 'content' => $prompt]],
      'stream'   => true,
      // gpt-oss — reasoning-модель: без ограничения она сжигает бюджет токенов
      // на скрытый chain-of-thought и обрывает финальный JSON на середине
      // (finish_reason: "length"), из-за чего JSON.parse на фронте падал.
      // reasoning_effort=low урезает "раздумья". max_completion_tokens=4096
      // — НЕ округлый запас "с головой": free-тир этого ключа на gpt-oss-120b
      // хард-лимитирован в 8000 токенов/минуту, и Groq считает в этот лимит
      // весь зарезервированный max_completion_tokens, а не только реально
      // использованное — запрос на 8000 гарантированно ловил 413 "Request
      // too large" (промпт ~600 токенов + резерв 8000 > лимита 8000).
      // 4096 оставляет запас под промпт и проверено хватает: самый тяжёлый
      // из наших промптов (план урока, high detail) укладывается в ~1900
      // токенов ответа даже с reasoning.
      'reasoning_effort'      => 'low',
      'max_completion_tokens' => 4096,
    ], JSON_UNESCAPED_UNICODE);

    $cafile = (string)($config['ssl']['cafile'] ?? '');

    $buf = '';
    $sentAny = false;
    $ch = curl_init($url);

    $opts = [
      CURLOPT_POST           => true,
      CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
      ],
      CURLOPT_POSTFIELDS     => $payload,
      CURLOPT_RETURNTRANSFER => false,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT        => 0,
      CURLOPT_WRITEFUNCTION  => function ($ch, string $chunk) use (&$buf, &$finishReason, &$sentAny): int {
        $buf .= $chunk;
        while (($pos = strpos($buf, "\n")) !== false) {
          $line = trim(substr($buf, 0, $pos));
          $buf = substr($buf, $pos + 1);

          if ($line === '' || strncmp($line, 'data:', 5) !== 0) continue;
          $payload = trim(substr($line, 5));
          if ($payload === '[DONE]') continue;

          $obj = json_decode($payload, true);
          if (!is_array($obj)) continue;

          $choice = $obj['choices'][0] ?? [];
          $text = $choice['delta']['content'] ?? null;
          if (is_string($text) && $text !== '') {
            self::sendEvent(['type' => 'delta', 'text' => $text]);
            self::flushNow();
            $sentAny = true;
          }
          if (!empty($choice['finish_reason'])) {
            $finishReason = $choice['finish_reason'];
          }
        }
        return strlen($chunk);
      },
    ];

    if ($cafile !== '' && is_file($cafile)) {
      $opts[CURLOPT_CAINFO] = $cafile;
      @putenv('SSL_CERT_FILE=' . $cafile);
    }

    curl_setopt_array($ch, $opts);

    $finishReason = null;
    $ok = curl_exec($ch);
    if ($ok === false) {
      $err = curl_error($ch);
      if (!$sentAny) return false; // caller may retry another provider
      self::sendEvent(['type' => 'error', 'message' => $err ?: 'curl_exec failed']);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return true;
    }

    $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    if ($code >= 400) {
      if (!$sentAny) return false; // caller may retry another provider
      self::sendEvent(['type' => 'error', 'message' => "Groq HTTP {$code}"]);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return true;
    }

    if (!$sentAny) {
      // 2xx но ни одного дельта-чанка — тело не в ожидаемом формате
      // OpenAI-style SSE. Тоже безопасно отдать другому провайдеру.
      return false;
    }

    // Модель уперлась в max_completion_tokens до того, как закончила ответ —
    // JSON/markdown на клиенте гарантированно оборван. Явно предупреждаем,
    // а не тихо отдаём "done" на половине документа (см. коммит про
    // reasoning_effort/max_completion_tokens — это тот же баг, страховка на
    // случай, если бюджета опять не хватит для другого промпта/модели).
    if ($finishReason === 'length') {
      self::sendEvent(['type' => 'error', 'message' => 'Groq response truncated (finish_reason=length) — try a shorter prompt or lower detail level']);
    }

    self::sendEvent(['type' => 'done']);
    self::flushNow();
    return true;
  }

  // @return bool — см. docblock streamGroq(), то же соглашение.
  private static function streamGemini(string $apiKey, string $model, string $prompt, array $config): bool
  {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/'
      . rawurlencode($model)
      . ':streamGenerateContent?key='
      . rawurlencode($apiKey);

    $payload = json_encode([
      'contents' => [
        ['parts' => [['text' => $prompt]]]
      ]
    ], JSON_UNESCAPED_UNICODE);

    $cafile = (string)($config['ssl']['cafile'] ?? '');

    $buf = '';
    $sentAny = false;
    $ch = curl_init($url);

    $opts = [
      CURLOPT_POST           => true,
      CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
      CURLOPT_POSTFIELDS     => $payload,
      CURLOPT_RETURNTRANSFER => false,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT        => 0,
      CURLOPT_WRITEFUNCTION  => function ($ch, string $chunk) use (&$buf, &$sentAny): int {
        $buf .= $chunk;
        while (true) {
          $start = strpos($buf, '{');
          if ($start === false) {
            $buf = '';
            break;
          }

          $level = 0;
          $inStr = false;
          $esc = false;
          $endPos = null;

          $len = strlen($buf);
          for ($i = $start; $i < $len; $i++) {
            $c = $buf[$i];
            if ($inStr) {
              if ($esc) { $esc = false; continue; }
              if ($c === '\\') { $esc = true; continue; }
              if ($c === '"') { $inStr = false; continue; }
              continue;
            } else {
              if ($c === '"') { $inStr = true; continue; }
              if ($c === '{') $level++;
              if ($c === '}') {
                $level--;
                if ($level === 0) { $endPos = $i; break; }
              }
            }
          }

          if ($endPos === null) break;

          $jsonStr = substr($buf, $start, $endPos - $start + 1);
          $buf = substr($buf, $endPos + 1);

          $obj = json_decode($jsonStr, true);
          if (!is_array($obj)) continue;

          $text = $obj['candidates'][0]['content']['parts'][0]['text'] ?? null;
          if (is_string($text) && $text !== '') {
            self::sendEvent(['type' => 'delta', 'text' => $text]);
            self::flushNow();
            $sentAny = true;
          }
        }
        return strlen($chunk);
      },
    ];

    if ($cafile !== '' && is_file($cafile)) {
      $opts[CURLOPT_CAINFO] = $cafile;
      @putenv('SSL_CERT_FILE=' . $cafile);
    }

    curl_setopt_array($ch, $opts);

    $ok = curl_exec($ch);
    if ($ok === false) {
      $err = curl_error($ch);
      if (!$sentAny) return false;
      self::sendEvent(['type' => 'error', 'message' => $err ?: 'curl_exec failed']);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return true;
    }

    $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    if ($code >= 400) {
      if (!$sentAny) return false;
      self::sendEvent(['type' => 'error', 'message' => "Gemini HTTP {$code}"]);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return true;
    }

    if (!$sentAny) return false;

    self::sendEvent(['type' => 'done']);
    self::flushNow();
    return true;
  }

  private static function sseHeaders(): void
  {
    http_response_code(200);
    header('Content-Type: text/event-stream; charset=utf-8');
    header('Cache-Control: no-cache, no-transform');
    header('Connection: keep-alive');
    @ini_set('output_buffering', 'off');
    @ini_set('zlib.output_compression', '0');
    @ini_set('implicit_flush', '1');
    while (ob_get_level() > 0) {
      @ob_end_flush();
    }
    @ob_implicit_flush(true);
  }

  private static function sendEvent(array $data): void
  {
    echo 'data: ' . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
  }

  private static function flushNow(): void
  {
    @flush();
  }
}
