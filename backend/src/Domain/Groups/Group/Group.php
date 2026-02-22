<?php

declare(strict_types=1);

namespace App\Domain\Groups\Group;

use App\Domain\Auth\User\UserId;
use App\Domain\DomainEvent;

final class Group
{
    /** @var DomainEvent[] */
    private array $events = [];

    private function __construct(
        private GroupId $id,
        private UserId $ownerId,
        private string $name,
        private \DateTimeImmutable $createdAt,
    ) {
    }

    public static function create(GroupId $id, UserId $ownerId, string $name): self
    {
        $normalizedName = trim($name);
        if ($normalizedName === '') {
            throw new \InvalidArgumentException('Group name cannot be empty');
        }

        $group = new self($id, $ownerId, $normalizedName, new \DateTimeImmutable('now', new \DateTimeZone('UTC')));
        $group->events[] = new GroupCreated($id, $group->createdAt);

        return $group;
    }

    public static function reconstitute(GroupId $id, UserId $ownerId, string $name, \DateTimeImmutable $createdAt): self
    {
        return new self($id, $ownerId, $name, $createdAt);
    }

    public function id(): GroupId { return $this->id; }
    public function ownerId(): UserId { return $this->ownerId; }
    public function name(): string { return $this->name; }
    public function createdAt(): \DateTimeImmutable { return $this->createdAt; }

    /** @return DomainEvent[] */
    public function releaseDomainEvents(): array
    {
        $events = $this->events;
        $this->events = [];

        return $events;
    }
}
