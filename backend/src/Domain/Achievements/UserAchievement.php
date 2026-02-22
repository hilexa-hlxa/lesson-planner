<?php
declare(strict_types=1);
namespace App\Domain\Achievements;
final class UserAchievement { private function __construct(private string $userId, private string $key, private \DateTimeImmutable $createdAt) {} public static function grant(string $userId, string $key): self { return new self($userId,$key,new \DateTimeImmutable('now', new \DateTimeZone('UTC'))); } public static function reconstitute(string $userId, string $key, \DateTimeImmutable $createdAt): self { return new self($userId,$key,$createdAt); } public function userId(): string { return $this->userId; } public function key(): string { return $this->key; } public function createdAt(): \DateTimeImmutable { return $this->createdAt; }}
