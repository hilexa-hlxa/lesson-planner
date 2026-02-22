<?php
declare(strict_types=1);
namespace App\Infrastructure\Persistence\PDO;
use App\Domain\Groups\Group\Group;use App\Domain\Groups\Group\GroupId;use App\Domain\Groups\Group\GroupRepository;use PDO;
final class PdoGroupRepository implements GroupRepository { public function __construct(private PDO $pdo) {} public function nextId(): GroupId { return GroupId::new(); } public function save(Group $group): void { $stmt=$this->pdo->prepare('INSERT INTO groups (id, owner_id, name, created_at) VALUES (:id,:owner,:name,:created)'); $stmt->execute(['id'=>$group->id()->value(),'owner'=>$group->ownerId()->value(),'name'=>$group->name(),'created'=>$group->createdAt()->format('Y-m-d H:i:s')]); }}
