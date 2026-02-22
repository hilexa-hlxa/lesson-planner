<?php

declare(strict_types=1);

namespace App\Infrastructure\Generation;

use App\Application\Generations\GenerateLessonStream\GeminiClient;
use Redis;

final class GeminiGenerationService implements GeminiClient
{
    private const DEFAULT_TTL = 900;

    private ?Redis $redis = null;

    public function __construct(
        private ?string $apiKey,
        private string $model,
        private ?string $cafile = null,
        private ?string $redisHost = null,
        private int $redisPort = 6379,
        private int $cacheTtl = self::DEFAULT_TTL,
    ) {
        if (!class_exists(Redis::class) || !$this->redisHost) {
            return;
        }

        try {
            $redis = new Redis();
            $redis->connect($this->redisHost, $this->redisPort, 1.0);
            $this->redis = $redis;
        } catch (\Throwable) {
            $this->redis = null;
        }
    }

    public function generate(string $prompt): string
    {
        $cacheKey = 'gemini:' . hash('sha256', $this->model . ':' . trim($prompt));

        if ($this->redis !== null) {
            $cached = $this->redis->get($cacheKey);
            if (is_string($cached) && $cached !== '') {
                return $cached;
            }
        }

        if (!$this->apiKey) {
            $fallback = "# Demo lesson\n\n" . $prompt;
            $this->storeCache($cacheKey, $fallback);
            return $fallback;
        }

        $url = 'https://generativelanguage.googleapis.com/v1beta/models/'
            . rawurlencode($this->model)
            . ':generateContent?key='
            . rawurlencode($this->apiKey);

        $payload = [
            'contents' => [[
                'parts' => [[
                    'text' => $prompt,
                ]],
            ]],
        ];

        $opts = [
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => json_encode($payload, JSON_THROW_ON_ERROR),
                'timeout' => 30,
            ],
        ];

        if ($this->cafile) {
            $opts['ssl'] = [
                'cafile' => $this->cafile,
                'verify_peer' => true,
                'verify_peer_name' => true,
            ];
        }

        $ctx = stream_context_create($opts);
        $resp = file_get_contents($url, false, $ctx);

        if ($resp === false) {
            throw new \RuntimeException('Gemini request failed');
        }

        $json = json_decode($resp, true, 512, JSON_THROW_ON_ERROR);
        $text = (string) ($json['candidates'][0]['content']['parts'][0]['text'] ?? '');
        $this->storeCache($cacheKey, $text);

        return $text;
    }

    private function storeCache(string $key, string $value): void
    {
        if ($this->redis === null || $value === '') {
            return;
        }

        $ttl = $this->cacheTtl > 0 ? $this->cacheTtl : self::DEFAULT_TTL;
        $this->redis->setex($key, $ttl, $value);
    }
}
