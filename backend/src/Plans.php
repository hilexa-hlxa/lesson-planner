<?php
declare(strict_types=1);

namespace App;

// Тарифы и их лимиты генерации — единственный источник правды на бэкенде.
// Держим цифры здесь, а не в SQL/index.php, чтобы поменять лимит можно было
// в одном месте. Фронтовые тексты (src/lib/plans.js) — отдельная, дублирующая
// копия для отображения: если лимиты меняются, поправить нужно оба места.
final class Plans
{
  public const LIMITS = [
    'free' => 15,
    'pro'  => 150,
  ];

  public static function limitFor(string $plan): int
  {
    return self::LIMITS[$plan] ?? self::LIMITS['free'];
  }

  // Сколько успешных генераций у пользователя в ТЕКУЩЕМ календарном месяце.
  // Считаем только status = 'done' — отказ по вине провайдера (просроченный
  // ключ, 5xx, рейт-лимит) не должен списывать квоту учителя за наш сбой.
  // Полный список статусов см. generations.status: pending/running/done/error.
  public static function usedThisMonth(\PDO $pdo, int $userId): int
  {
    $st = $pdo->prepare("
      SELECT COUNT(*)::int AS n
        FROM generations
       WHERE user_id = :uid
         AND status = 'done'
         AND created_at >= date_trunc('month', now())
    ");
    $st->execute([':uid' => $userId]);
    return (int)($st->fetchColumn() ?: 0);
  }

  // Полная картина по квоте — используется и для блокировки перед генерацией,
  // и для отображения "12/15" пользователю ДО того, как он упрётся в лимит.
  public static function usage(\PDO $pdo, int $userId, string $plan): array
  {
    $limit = self::limitFor($plan);
    $used  = self::usedThisMonth($pdo, $userId);
    return [
      'plan'      => $plan,
      'limit'     => $limit,
      'used'      => $used,
      'remaining' => max(0, $limit - $used),
    ];
  }
}
