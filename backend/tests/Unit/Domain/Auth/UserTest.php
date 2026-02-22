<?php
declare(strict_types=1);

namespace Tests\Unit\Domain\Auth;

use App\Domain\Auth\User\Email;
use App\Domain\Auth\User\InvalidEmail;
use App\Domain\Auth\User\PasswordHash;
use App\Domain\Auth\User\User;
use App\Domain\Auth\User\UserId;
use App\Domain\Auth\User\UserRegistered;
use PHPUnit\Framework\TestCase;

final class UserTest extends TestCase
{
    public function testRegisterAddsDomainEvent(): void
    {
        $user = User::register(UserId::new(), Email::fromString('test@example.com'), PasswordHash::fromHash('hash'));
        $events = $user->releaseDomainEvents();

        self::assertCount(1, $events);
        self::assertInstanceOf(UserRegistered::class, $events[0]);
    }

    public function testInvalidEmailThrows(): void
    {
        $this->expectException(InvalidEmail::class);
        Email::fromString('bad-email');
    }
}
