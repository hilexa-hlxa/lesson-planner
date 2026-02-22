<?php
declare(strict_types=1);
namespace App\Application\Achievements\GrantAchievement;
final class GrantAchievementCommand { public function __construct(public string $userId, public string $key, public int $coinsReward = 5) {} }
