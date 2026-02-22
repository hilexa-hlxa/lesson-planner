<?php
declare(strict_types=1);

namespace Tests\Unit\Application\Auth;

use App\Application\Auth\RegisterUser\RegisterUserCommand;
use App\Application\Auth\RegisterUser\RegisterUserHandler;
use App\Application\Auth\Security\PasswordHasher;
use App\Application\Shared\TransactionManager;
use App\Domain\Audit\AuditLog;
use App\Domain\Audit\AuditLogRepository;
use App\Domain\Auth\User\Email;
use App\Domain\Auth\User\PasswordHash;
use App\Domain\Auth\User\PasswordTooShort;
use App\Domain\Auth\User\User;
use App\Domain\Auth\User\UserAlreadyExists;
use App\Domain\Auth\User\UserId;
use App\Domain\Auth\User\UserRepository;
use PHPUnit\Framework\TestCase;

final class RegisterUserHandlerTest extends TestCase
{
    public function testHandlerUsesTransactionAndSavesUser(): void
    {
        $users = new class implements UserRepository {
            public ?User $saved = null;
            public function nextId(): UserId { return UserId::fromString('u-1'); }
            public function byEmail(Email $email): ?User { return null; }
            public function save(User $user): void { $this->saved = $user; }
        };

        $hasher = new class implements PasswordHasher {
            public function hash(string $plain): string { return 'hashed-'.$plain; }
            public function verify(string $plain, string $hash): bool { return true; }
        };

        $tx = new class implements TransactionManager {
            public bool $called = false;
            public function transactional(callable $callback): mixed { $this->called = true; return $callback(); }
        };

        $audit = new class implements AuditLogRepository {
            public function save(AuditLog $auditLog): void {}
        };

        $handler = new RegisterUserHandler($users, $hasher, $tx, $audit);
        $result = $handler->handle(new RegisterUserCommand('user@example.com', '1234567890'));

        self::assertTrue($tx->called);
        self::assertInstanceOf(User::class, $users->saved);
        self::assertSame('u-1', $result->userId);
    }

    public function testShortPasswordThrowsDomainError(): void
    {
        $handler = new RegisterUserHandler(
            new class implements UserRepository {
                public function nextId(): UserId { return UserId::fromString('u-1'); }
                public function byEmail(Email $email): ?User { return null; }
                public function save(User $user): void {}
            },
            new class implements PasswordHasher {
                public function hash(string $plain): string { return 'unused'; }
                public function verify(string $plain, string $hash): bool { return false; }
            },
            new class implements TransactionManager {
                public function transactional(callable $callback): mixed { return $callback(); }
            },
            new class implements AuditLogRepository {
                public function save(AuditLog $auditLog): void {}
            },
        );

        $this->expectException(PasswordTooShort::class);
        $handler->handle(new RegisterUserCommand('user@example.com', 'short'));
    }

    public function testDuplicateEmailThrowsUserAlreadyExists(): void
    {
        $existingUser = User::reconstitute(
            UserId::fromString('u-1'),
            Email::fromString('user@example.com'),
            PasswordHash::fromHash('hash'),
            new \DateTimeImmutable('2026-01-01T00:00:00+00:00')
        );

        $handler = new RegisterUserHandler(
            new class($existingUser) implements UserRepository {
                public function __construct(private User $existingUser) {}
                public function nextId(): UserId { return UserId::fromString('u-2'); }
                public function byEmail(Email $email): ?User { return $this->existingUser; }
                public function save(User $user): void {}
            },
            new class implements PasswordHasher {
                public function hash(string $plain): string { return 'hashed-'.$plain; }
                public function verify(string $plain, string $hash): bool { return true; }
            },
            new class implements TransactionManager {
                public function transactional(callable $callback): mixed { return $callback(); }
            },
            new class implements AuditLogRepository {
                public function save(AuditLog $auditLog): void {}
            },
        );

        $this->expectException(UserAlreadyExists::class);
        $handler->handle(new RegisterUserCommand('user@example.com', '1234567890'));
    }
}
