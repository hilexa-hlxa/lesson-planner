<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Comments;

use App\Domain\Auth\User\UserId;
use App\Domain\Comments\Comment\Comment;
use App\Domain\Comments\Comment\CommentAdded;
use App\Domain\Comments\Comment\CommentId;
use App\Domain\Posts\Post\PostId;
use PHPUnit\Framework\TestCase;

final class CommentTest extends TestCase
{
    public function testAddAddsDomainEvent(): void
    {
        $comment = Comment::add(CommentId::new(), PostId::fromString('p-1'), UserId::fromString('u-1'), 'Hello');
        $events = $comment->releaseDomainEvents();

        self::assertCount(1, $events);
        self::assertInstanceOf(CommentAdded::class, $events[0]);
    }

    public function testEmptyBodyThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Comment::add(CommentId::new(), PostId::fromString('p-1'), UserId::fromString('u-1'), '  ');
    }
}
