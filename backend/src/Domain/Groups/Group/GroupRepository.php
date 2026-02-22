<?php
declare(strict_types=1);
namespace App\Domain\Groups\Group;
interface GroupRepository { public function nextId(): GroupId; public function save(Group $group): void; }
