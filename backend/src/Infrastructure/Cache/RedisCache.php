<?php

declare(strict_types=1);

namespace App\Infrastructure\Cache;

use Redis;

class RedisCache
{
    private const DEFAULT_PREFIX = 'app:';

    public function __construct(
        private Redis $redis,
        private string $prefix = self::DEFAULT_PREFIX,
        private int $ttlSeconds = 300,
    ) {
    }

    public function get(string $key): ?string
    {
        $value = $this->redis->get($this->prefix . $key);

        return $value === false ? null : (string) $value;
    }

    public function set(string $key, string $value, ?int $ttlSeconds = null): void
    {
        $ttl = $ttlSeconds ?? $this->ttlSeconds;
        $this->redis->setex($this->prefix . $key, $ttl, $value);
    }

    public function del(string $key): void
    {
        $this->redis->del([$this->prefix . $key]);
    }
}
