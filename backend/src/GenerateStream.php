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

    if ($apiKey === '') {
      self::sendEvent(['type' => 'error', 'message' => 'No gemini.api_key in config']);
      self::sendEvent(['type' => 'done']);
      self::flushNow();
      return;
    }

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
        // Gemini присылает json-объекты кусками/строками. Буферизуем и пытаемся парсить.
        $buf .= $chunk;

        // Часто это line-delimited JSON, но не гарантировано.
        // Будем извлекать из буфера последовательные JSON-объекты.
        while (true) {
          $start = strpos($buf, '{');
          if ($start === false) {
            // нет начала json
            $buf = '';
            break;
          }

          // пробуем найти конец объекта грубо: по балансировке скобок
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

          if ($endPos === null) {
            // объект ещё не доехал
            break;
          }

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

    // SSL CA bundle
    if ($cafile !== '' && is_file($cafile)) {
      $opts[CURLOPT_CAINFO] = $cafile;
      // иногда помогает для некоторых сборок
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

    // выключаем буферы
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
