<?php

declare(strict_types=1);

namespace Tests\Unit\Application\Auth;

use App\Application\Auth\LoginUser\LoginUserCommand;
use App\Application\Auth\LoginUser\LoginUserHandler;
use App\Application\Auth\Security\PasswordHasher;
use App\Application\Shared\TransactionManager;
use App\Domain\Auth\User\Email;
use App\Domain\Auth\User\InvalidCredentials;
use App\Domain\Auth\User\PasswordHash;
use App\Domain\Auth\User\User;
use App\Domain\Auth\User\UserId;
use App\Domain\Auth\User\UserRepository;
use PHPUnit\Framework\TestCase;

final class LoginUserHandlerTest extends TestCase
{
    public function testInvalidPasswordThrowsInvalidCredentials(): void
    {
        $users = new class implements UserRepository {
            public function nextId(): UserId { return UserId::fromString('unused'); }
            public function byEmail(Email $email): ?User
            {
                return User::reconstitute(
                    UserId::fromString('u-1'),
                    Email::fromString('user@example.com'),
                    PasswordHash::fromHash('hash'),
                    new \DateTimeImmutable('2026-01-01T00:00:00+00:00')
                );
            }
            public function save(User $user): void {}
        };

        $hasher = new class implements PasswordHasher {
            public function hash(string $plain): string { return 'unused'; }
            public function verify(string $plain, string $hash): bool { return false; }
        };

        $tx = new class implements TransactionManager {
            public function transactional(callable $callback): mixed { return $callback(); }
        };

        $handler = new LoginUserHandler($users, $hasher, $tx);

        $this->expectException(InvalidCredentials::class);
        $handler->handle(new LoginUserCommand('user@example.com', 'wrong'));
    }

    public function testValidPasswordReturnsUserId(): void
    {
        $users = new class implements UserRepository {
            public function nextId(): UserId { return UserId::fromString('unused'); }
            public function byEmail(Email $email): ?User
            {
                return User::reconstitute(
                    UserId::fromString('u-42'),
                    Email::fromString('user@example.com'),
                    PasswordHash::fromHash('hash'),
                    new \DateTimeImmutable('2026-01-01T00:00:00+00:00')
                );
            }
            public function save(User $user): void {}
        };

        $hasher = new class implements PasswordHasher {
            public function hash(string $plain): string { return 'unused'; }
            public function verify(string $plain, string $hash): bool { return true; }
        };

        $tx = new class implements TransactionManager {
            public function transactional(callable $callback): mixed { return $callback(); }
        };

        $handler = new LoginUserHandler($users, $hasher, $tx);
        $result = $handler->handle(new LoginUserCommand('user@example.com', 'right'));

        self::assertSame('u-42', $result->userId);
    }
}
