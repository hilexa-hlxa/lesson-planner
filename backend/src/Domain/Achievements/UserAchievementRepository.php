<?php
declare(strict_types=1);
namespace App\Domain\Achievements;
interface UserAchievementRepository {
    public function exists(string $userId, string $key): bool;
    public function save(UserAchievement $achievement): void;
    /** @return UserAchievement[] */
    public function listByUser(string $userId): array;
}
