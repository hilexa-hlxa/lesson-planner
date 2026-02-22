<?php
declare(strict_types=1);
namespace App\Infrastructure\Persistence\PDO;
use App\Domain\Achievements\UserAchievement;use App\Domain\Achievements\UserAchievementRepository;use PDO;
final class PdoUserAchievementRepository implements UserAchievementRepository { public function __construct(private PDO $pdo) {} public function exists(string $userId, string $key): bool { $st=$this->pdo->prepare('SELECT 1 FROM user_achievements WHERE user_id=:u AND key_name=:k LIMIT 1'); $st->execute(['u'=>$userId,'k'=>$key]); return $st->fetch()!==false; } public function save(UserAchievement $achievement): void { $st=$this->pdo->prepare('INSERT INTO user_achievements (user_id,key_name,created_at) VALUES (:u,:k,:c)'); $st->execute(['u'=>$achievement->userId(),'k'=>$achievement->key(),'c'=>$achievement->createdAt()->format(DATE_ATOM)]); }}
