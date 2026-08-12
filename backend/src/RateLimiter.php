<?php
declare(strict_types=1);

namespace App;

/**
 * Счётчик обращений со скользящим окном, общий для всех воркеров.
 *
 * Хранится в базе, а не в памяти процесса: у Apache каждый запрос может попасть
 * в свой воркер, и локальный счётчик ничего бы не ограничил.
 *
 * Два режима:
 *  - guard() + fail() — считаем ТОЛЬКО неудачи (неверный код, неверный пароль).
 *    Класс из тридцати учеников заходит с одного школьного IP: если считать все
 *    запросы, половина класса упрётся в лимит на ровном месте.
 *  - enforce() — считаем каждое обращение. Для дорогих операций вроде генерации,
 *    где ключ привязан к пользователю, а не к IP.
 *
 * Ошибки базы не должны ронять запрос: если счётчик недоступен, пропускаем
 * (fail-open) и пишем в лог. Доступность важнее, остальные проверки на месте.
 */
final class RateLimiter
{
  /** Как часто подчищаем старые строки (1 из N обращений) */
  private const CLEANUP_CHANCE = 50;

  public static function clientIp(): string
  {
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    return $ip !== '' ? $ip : 'unknown';
  }

  /** Читает счётчик, НЕ увеличивая его. */
  public static function peek(\PDO $pdo, string $key, int $windowSeconds): array
  {
    try {
      $st = $pdo->prepare("
        SELECT hits,
               EXTRACT(EPOCH FROM (window_start + ((:win)::text || ' seconds')::interval - NOW())) AS retry_after
        FROM rate_limits
        WHERE bucket = :bucket
          AND window_start > NOW() - ((:win2)::text || ' seconds')::interval
      ");
      $st->execute([
        ':bucket' => self::normalize($key),
        ':win'    => (string)$windowSeconds,
        ':win2'   => (string)$windowSeconds,
      ]);
      $row = $st->fetch(\PDO::FETCH_ASSOC);

      return [
        'hits'        => (int)($row['hits'] ?? 0),
        'retry_after' => max(1, (int)ceil((float)($row['retry_after'] ?? $windowSeconds))),
      ];
    } catch (\Throwable $e) {
      error_log("RateLimiter peek unavailable: " . $e->getMessage());
      return ['hits' => 0, 'retry_after' => 0];
    }
  }

  /** Увеличивает счётчик на единицу. Вызываем ПОСЛЕ неудачной попытки. */
  public static function fail(\PDO $pdo, string $key, int $windowSeconds): void
  {
    try {
      self::maybeCleanup($pdo);

      $st = $pdo->prepare("
        INSERT INTO rate_limits (bucket, hits, window_start)
        VALUES (:bucket, 1, NOW())
        ON CONFLICT (bucket) DO UPDATE SET
          hits = CASE
            WHEN rate_limits.window_start < NOW() - ((:win)::text || ' seconds')::interval
            THEN 1 ELSE rate_limits.hits + 1 END,
          window_start = CASE
            WHEN rate_limits.window_start < NOW() - ((:win2)::text || ' seconds')::interval
            THEN NOW() ELSE rate_limits.window_start END
      ");
      $st->execute([
        ':bucket' => self::normalize($key),
        ':win'    => (string)$windowSeconds,
        ':win2'   => (string)$windowSeconds,
      ]);
    } catch (\Throwable $e) {
      error_log("RateLimiter fail-count unavailable: " . $e->getMessage());
    }
  }

  /** Если неудач уже слишком много — 429 и конец запроса. Счётчик не трогает. */
  public static function guard(\PDO $pdo, string $key, int $limit, int $windowSeconds): void
  {
    $r = self::peek($pdo, $key, $windowSeconds);
    if ($r['hits'] < $limit) return;

    header('Retry-After: ' . $r['retry_after']);
    \Response::error('Too many attempts. Try again later.', 429, ['retry_after' => $r['retry_after']]);
  }

  /** Считает КАЖДОЕ обращение и обрывает запрос при превышении. */
  public static function enforce(\PDO $pdo, string $key, int $limit, int $windowSeconds): void
  {
    $before = self::peek($pdo, $key, $windowSeconds);
    if ($before['hits'] >= $limit) {
      header('Retry-After: ' . $before['retry_after']);
      \Response::error('Too many requests. Try again later.', 429, ['retry_after' => $before['retry_after']]);
    }
    self::fail($pdo, $key, $windowSeconds);
  }

  /** Сбрасывает счётчик — после удачной попытки. */
  public static function reset(\PDO $pdo, string $key): void
  {
    try {
      $pdo->prepare("DELETE FROM rate_limits WHERE bucket = :bucket")
          ->execute([':bucket' => self::normalize($key)]);
    } catch (\Throwable $e) {
      error_log("RateLimiter reset failed: " . $e->getMessage());
    }
  }

  private static function normalize(string $key): string
  {
    return mb_substr($key, 0, 200);
  }

  private static function maybeCleanup(\PDO $pdo): void
  {
    if (random_int(1, self::CLEANUP_CHANCE) !== 1) return;
    $pdo->exec("DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 day'");
  }
}
