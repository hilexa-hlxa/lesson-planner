<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Audit;

use App\Domain\Audit\AuditLog;
use App\Domain\Auth\User\UserId;
use App\Domain\Auth\User\UserRegistered;
use App\Domain\Comments\Comment\CommentAdded;
use App\Domain\Comments\Comment\CommentId;
use App\Domain\Groups\Group\GroupCreated;
use App\Domain\Groups\Group\GroupId;
use App\Domain\Posts\Post\PostCreated;
use App\Domain\Posts\Post\PostId;
use PHPUnit\Framework\TestCase;

final class AuditLogTest extends TestCase
{
    public function testUserRegisteredPayloadContainsUserId(): void
    {
        $event = new UserRegistered(UserId::fromString('u-1'), new \DateTimeImmutable('2026-01-01T00:00:00+00:00'));
        $payload = json_decode(AuditLog::fromDomainEvent($event)->payload(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame('u-1', $payload['userId']);
        self::assertArrayHasKey('postId', $payload);
        self::assertNull($payload['postId']);
    }

    public function testPostAndCommentPayloadContainBusinessFields(): void
    {
        $postEvent = new PostCreated(
            PostId::fromString('p-1'),
            UserId::fromString('u-1'),
            'DDD title',
            new \DateTimeImmutable('2026-01-01T00:00:00+00:00')
        );
        $postPayload = json_decode(AuditLog::fromDomainEvent($postEvent)->payload(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame('p-1', $postPayload['postId']);
        self::assertSame('u-1', $postPayload['authorId']);
        self::assertSame('DDD title', $postPayload['title']);

        $commentEvent = new CommentAdded(
            CommentId::fromString('c-1'),
            PostId::fromString('p-1'),
            UserId::fromString('u-2'),
            new \DateTimeImmutable('2026-01-01T00:00:00+00:00')
        );
        $commentPayload = json_decode(AuditLog::fromDomainEvent($commentEvent)->payload(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame('c-1', $commentPayload['commentId']);
        self::assertSame('p-1', $commentPayload['postId']);
        self::assertSame('u-2', $commentPayload['authorId']);
    }

    public function testGroupPayloadContainsGroupId(): void
    {
        $event = new GroupCreated(GroupId::fromString('g-1'), new \DateTimeImmutable('2026-01-01T00:00:00+00:00'));
        $payload = json_decode(AuditLog::fromDomainEvent($event)->payload(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame('g-1', $payload['groupId']);
        self::assertArrayHasKey('commentId', $payload);
    }
}
