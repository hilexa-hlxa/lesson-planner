<?php
declare(strict_types=1);
namespace App\Domain\Economy;
final class Wallet { private function __construct(private string $userId, private int $coins) {} public static function create(string $userId, int $coins = 0): self { return new self($userId,$coins); } public function addCoins(int $amount): void { if ($amount <= 0) throw new \DomainException('Coins amount must be positive'); $this->coins += $amount; } public function userId(): string { return $this->userId; } public function coins(): int { return $this->coins; }}
