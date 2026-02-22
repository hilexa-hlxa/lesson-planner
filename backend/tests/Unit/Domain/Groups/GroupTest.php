<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Groups;

use App\Domain\Auth\User\UserId;
use App\Domain\Groups\Group\Group;
use App\Domain\Groups\Group\GroupCreated;
use App\Domain\Groups\Group\GroupId;
use PHPUnit\Framework\TestCase;

final class GroupTest extends TestCase
{
    public function testCreateAddsDomainEvent(): void
    {
        $group = Group::create(GroupId::new(), UserId::fromString('u-1'), 'Math');
        $events = $group->releaseDomainEvents();

        self::assertCount(1, $events);
        self::assertInstanceOf(GroupCreated::class, $events[0]);
    }

    public function testEmptyNameThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Group::create(GroupId::new(), UserId::fromString('u-1'), '   ');
    }
}
