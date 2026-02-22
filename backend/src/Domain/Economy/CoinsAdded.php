<?php
declare(strict_types=1);
namespace App\Domain\Economy;
use App\Domain\DomainEvent;
final class CoinsAdded implements DomainEvent { public function __construct(private string $userId, private int $amount, private \DateTimeImmutable $occurredOn) {} public function userId(): string { return $this->userId; } public function amount(): int { return $this->amount; } public function occurredOn(): \DateTimeImmutable { return $this->occurredOn; }}
