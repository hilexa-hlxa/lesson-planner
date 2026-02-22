<?php

declare(strict_types=1);

namespace Tests\Unit\Application\Groups;

use App\Application\Groups\CreateGroup\CreateGroupCommand;
use App\Application\Groups\CreateGroup\CreateGroupHandler;
use App\Application\Shared\TransactionManager;
use App\Domain\Audit\AuditLog;
use App\Domain\Audit\AuditLogRepository;
use App\Domain\Groups\Group\Group;
use App\Domain\Groups\Group\GroupId;
use App\Domain\Groups\Group\GroupRepository;
use PHPUnit\Framework\TestCase;

final class CreateGroupHandlerTest extends TestCase
{
    public function testCreatesGroupAndWritesAuditLogInTransaction(): void
    {
        $groups = new class implements GroupRepository {
            public ?Group $saved = null;
            public function nextId(): GroupId { return GroupId::fromString('g-1'); }
            public function save(Group $group): void { $this->saved = $group; }
        };

        $audit = new class implements AuditLogRepository {
            public array $saved = [];
            public function save(AuditLog $auditLog): void { $this->saved[] = $auditLog; }
        };

        $tx = new class implements TransactionManager {
            public bool $called = false;
            public function transactional(callable $callback): mixed { $this->called = true; return $callback(); }
        };

        $handler = new CreateGroupHandler($groups, $tx, $audit);
        $result = $handler->handle(new CreateGroupCommand('u-1', 'Team'));

        self::assertSame('g-1', $result->groupId);
        self::assertNotNull($groups->saved);
        self::assertCount(1, $audit->saved);
        self::assertTrue($tx->called);
    }
}
