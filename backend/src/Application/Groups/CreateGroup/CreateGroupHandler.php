<?php

declare(strict_types=1);

namespace App\Application\Groups\CreateGroup;

use App\Application\Shared\TransactionManager;
use App\Domain\Audit\AuditLog;
use App\Domain\Audit\AuditLogRepository;
use App\Domain\Auth\User\UserId;
use App\Domain\Groups\Group\Group;
use App\Domain\Groups\Group\GroupRepository;

final class CreateGroupHandler
{
    public function __construct(
        private GroupRepository $groups,
        private TransactionManager $tx,
        private AuditLogRepository $audit,
    ) {
    }

    public function handle(CreateGroupCommand $command): CreateGroupResult
    {
        return $this->tx->transactional(function () use ($command): CreateGroupResult {
            $group = Group::create($this->groups->nextId(), UserId::fromString($command->ownerId), $command->name);
            $this->groups->save($group);

            foreach ($group->releaseDomainEvents() as $event) {
                $this->audit->save(AuditLog::fromDomainEvent($event));
            }

            return new CreateGroupResult($group->id()->value());
        });
    }
}
