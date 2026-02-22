<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\Posts;

use App\Domain\Auth\User\UserId;
use App\Domain\Posts\Post\Post;
use App\Domain\Posts\Post\PostCreated;
use App\Domain\Posts\Post\PostId;
use PHPUnit\Framework\TestCase;

final class PostTest extends TestCase
{
    public function testCreateAddsDomainEvent(): void
    {
        $post = Post::create(PostId::new(), UserId::fromString('u-1'), 'Title', 'Body');
        $events = $post->releaseDomainEvents();

        self::assertCount(1, $events);
        self::assertInstanceOf(PostCreated::class, $events[0]);
    }

    public function testEmptyTitleThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Post::create(PostId::new(), UserId::fromString('u-1'), ' ', 'Body');
    }
}
