<?php
declare(strict_types=1);

namespace App;

final class GenerateStream
{
  public static function handle(array $config, ?array $body = null): void
  {
    $groqKey    = (string)($config['groq']['api_key'] ?? '');
    $groqModel  = (string)($config['groq']['model'] ?? 'openai/gpt-oss-120b');

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

    // Groq — единственный провайдер (см. GenerateStream в ROADMAP.md): решили
    // осознанно работать только на бесплатных ключах Groq, без Gemini как
    // запасного варианта. Демо-режим — если ключ вообще не настроен.
    //
    // streamGroq() возвращает bool: true, если клиенту ушёл хоть один
    // дельта-чанк (успех ИЛИ обрыв на середине — SSE-поток не "переиграть" с
    // начала). false — сорвался ДО первого чанка (типично — мгновенная
    // HTTP-ошибка вроде 401/429/5xx) и ничего клиенту ещё не отправил; тогда
    // handle() сам шлёт 'error'/'done' с точной причиной сбоя.
    if ($groqKey !== '') {
      $groqReason = null;
      if (self::streamGroq($groqKey, $groqModel, $prompt, $config, $groqReason)) return;

      self::sendEvent(['type' => 'error', 'message' => "Generation provider unavailable (Groq: {$groqReason})"]);
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
  private static function streamGroq(string $apiKey, string $model, string $prompt, array $config, ?string &$failReason = null): bool
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
    // Захват сырого тела ответа отдельно от $buf: строчный парсер ниже
    // консьюмит $buf по каждому "\n" независимо от того, начинается ли
    // строка с "data:" — если тело ошибки Groq заканчивается переводом
    // строки (как обычно и бывает у JSON-ответов), к моменту завершения
    // curl_exec() в $buf уже пусто, и подставлять его в failReason было бы
    // подставлять пустую строку. rawTail собирается независимо и обрезан,
    // чтобы не раздувать память на успешном стриме в сотни КБ текста.
    $rawTail = '';
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
      CURLOPT_WRITEFUNCTION  => function ($ch, string $chunk) use (&$buf, &$finishReason, &$sentAny, &$rawTail): int {
        if (strlen($rawTail) < 2000) $rawTail .= $chunk;
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
      if (!$sentAny) { $failReason = $err ?: 'curl_exec failed'; return false; } // caller may retry another provider
      self::sendEvent(['type' => 'error', 'message' => $err ?: 'curl_exec failed']);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return true;
    }

    $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    if ($code >= 400) {
      // "HTTP 401" само по себе не говорит, ключ ли невалиден, отозван, не
      // той организации и т.д. — тело ответа обычно говорит прямо
      // ({"error":{"message":"Invalid API Key",...}}). rawTail — сырые байты
      // независимо от построчного парсера выше (см. его объявление).
      $bodySnippet = mb_substr(trim($rawTail), 0, 300);
      $reason = "HTTP {$code}" . ($bodySnippet !== '' ? ": {$bodySnippet}" : '');
      if (!$sentAny) { $failReason = $reason; return false; } // caller may retry another provider
      self::sendEvent(['type' => 'error', 'message' => "Groq {$reason}"]);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return true;
    }

    if (!$sentAny) {
      // 2xx но ни одного дельта-чанка — тело не в ожидаемом формате
      // OpenAI-style SSE. Тоже безопасно отдать другому провайдеру.
      $failReason = 'empty/unexpected response format';
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
