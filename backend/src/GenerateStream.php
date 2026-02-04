<?php
declare(strict_types=1);

namespace App;

final class GenerateStream
{
  public static function handle(array $config, ?array $body = null): void
  {
    $apiKey = (string)($config['gemini']['api_key'] ?? '');
    $model  = (string)($config['gemini']['model'] ?? 'gemini-2.0-flash');

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

    // --- [НАЧАЛО ЗАГЛУШКИ] ---
    // Если ключа нет (или он пустой), включаем режим симуляции
    if ($apiKey === '') {
      
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

      // Сообщаем, что генерация завершена
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return; 
    }
    // --- [КОНЕЦ ЗАГЛУШКИ] ---

    // Дальше идет старый код для реального Gemini (он сработает, если ты потом добавишь ключ)
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
    $ch = curl_init($url);

    $opts = [
      CURLOPT_POST           => true,
      CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
      CURLOPT_POSTFIELDS     => $payload,
      CURLOPT_RETURNTRANSFER => false,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT        => 0,
      CURLOPT_WRITEFUNCTION  => function ($ch, string $chunk) use (&$buf): int {
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
      self::sendEvent(['type' => 'error', 'message' => $err ?: 'curl_exec failed']);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return;
    }

    $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    if ($code >= 400) {
      self::sendEvent(['type' => 'error', 'message' => "Gemini HTTP {$code}"]);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return;
    }

    self::sendEvent(['type' => 'done']);
    self::flushNow();
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