<?php
declare(strict_types=1);

namespace App\Domain\Auth\User;

use App\Domain\DomainEvent;

final class User
{
    /** @var DomainEvent[] */
    private array $events = [];

    private function __construct(private UserId $id, private Email $email, private PasswordHash $passwordHash, private \DateTimeImmutable $createdAt) {}

    public static function register(UserId $id, Email $email, PasswordHash $passwordHash): self
    {
        $user = new self($id, $email, $passwordHash, new \DateTimeImmutable('now', new \DateTimeZone('UTC')));
        $user->events[] = new UserRegistered($id, $user->createdAt);

        return $user;
    }

    public static function reconstitute(UserId $id, Email $email, PasswordHash $passwordHash, \DateTimeImmutable $createdAt): self
    {
        return new self($id, $email, $passwordHash, $createdAt);
    }

    public function id(): UserId { return $this->id; }
    public function email(): Email { return $this->email; }
    public function passwordHash(): PasswordHash { return $this->passwordHash; }
    public function createdAt(): \DateTimeImmutable { return $this->createdAt; }

    /** @return DomainEvent[] */
    public function releaseDomainEvents(): array { $events = $this->events; $this->events = []; return $events; }
}
