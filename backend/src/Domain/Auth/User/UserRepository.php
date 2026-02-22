<?php
declare(strict_types=1);

namespace App\Domain\Auth\User;

interface UserRepository
{
    public function nextId(): UserId;
    public function byEmail(Email $email): ?User;
    public function save(User $user): void;
}
