<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\PDO;

use App\Domain\Auth\User\Email;
use App\Domain\Auth\User\PasswordHash;
use App\Domain\Auth\User\User;
use App\Domain\Auth\User\UserAlreadyExists;
use App\Domain\Auth\User\UserId;
use App\Domain\Auth\User\UserRepository;
use PDO;
use PDOException;

final class PdoUserRepository implements UserRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function nextId(): UserId
    {
        return UserId::new();
    }

    public function byEmail(Email $email): ?User
    {
        $stmt = $this->pdo->prepare('SELECT * FROM auth_users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email->value()]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return User::reconstitute(
            UserId::fromString((string) $row['id']),
            Email::fromString((string) $row['email']),
            PasswordHash::fromHash((string) $row['password_hash']),
            new \DateTimeImmutable((string) $row['created_at'])
        );
    }

    public function save(User $user): void
    {
        try {
            $stmt = $this->pdo->prepare(
                'INSERT INTO auth_users (id, email, password_hash, created_at) VALUES (:id,:email,:password_hash,:created_at)'
            );
            $stmt->execute([
                'id' => $user->id()->value(),
                'email' => $user->email()->value(),
                'password_hash' => $user->passwordHash()->value(),
                'created_at' => $user->createdAt()->format(DATE_ATOM),
            ]);
        } catch (PDOException $e) {
            $code = (string) $e->getCode();
            $message = mb_strtolower($e->getMessage());

            if ($code === '23505' || $code === '23000' || str_contains($message, 'unique')) {
                throw new UserAlreadyExists('Email already exists', 0, $e);
            }

            throw $e;
        }
    }
}
