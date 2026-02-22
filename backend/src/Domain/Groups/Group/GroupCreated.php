<?php
declare(strict_types=1);
namespace App\Domain\Groups\Group;
use App\Domain\DomainEvent;
final class GroupCreated implements DomainEvent { public function __construct(public readonly GroupId $groupId, private \DateTimeImmutable $occurredOn) {} public function occurredOn(): \DateTimeImmutable { return $this->occurredOn; }}
