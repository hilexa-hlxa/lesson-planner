<?php
declare(strict_types=1);
namespace App\Application\Groups\CreateGroup;
final class CreateGroupCommand { public function __construct(public readonly string $ownerId, public readonly string $name) {} }
