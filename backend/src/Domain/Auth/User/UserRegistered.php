<?php
declare(strict_types=1);

namespace App\Domain\Auth\User;

use App\Domain\DomainEvent;

final class UserRegistered implements DomainEvent
{
    public function __construct(public readonly UserId $userId, private \DateTimeImmutable $occurredOn) {}
    public function occurredOn(): \DateTimeImmutable { return $this->occurredOn; }
}
