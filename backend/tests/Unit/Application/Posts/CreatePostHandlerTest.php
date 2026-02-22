<?php

declare(strict_types=1);

namespace Tests\Unit\Application\Posts;

use App\Application\Posts\CreatePost\CreatePostCommand;
use App\Application\Posts\CreatePost\CreatePostHandler;
use App\Application\Shared\TransactionManager;
use App\Domain\Audit\AuditLog;
use App\Domain\Audit\AuditLogRepository;
use App\Domain\Posts\Post\Post;
use App\Domain\Posts\Post\PostId;
use App\Domain\Posts\Post\PostRepository;
use PHPUnit\Framework\TestCase;

final class CreatePostHandlerTest extends TestCase
{
    public function testCreatesPostAndWritesAuditLogInTransaction(): void
    {
        $posts = new class implements PostRepository {
            public ?Post $saved = null;
            public function nextId(): PostId { return PostId::fromString('p-1'); }
            public function byId(PostId $id): ?Post { return null; }
            public function save(Post $post): void { $this->saved = $post; }
        };

        $audit = new class implements AuditLogRepository {
            public array $saved = [];
            public function save(AuditLog $auditLog): void { $this->saved[] = $auditLog; }
        };

        $tx = new class implements TransactionManager {
            public bool $called = false;
            public function transactional(callable $callback): mixed { $this->called = true; return $callback(); }
        };

        $handler = new CreatePostHandler($posts, $tx, $audit);
        $result = $handler->handle(new CreatePostCommand('author-1', 'Title', 'Body'));

        self::assertSame('p-1', $result->postId);
        self::assertNotNull($posts->saved);
        self::assertCount(1, $audit->saved);
        self::assertTrue($tx->called);
    }

    public function testEmptyTitleThrowsValidationError(): void
    {
        $handler = new CreatePostHandler(
            new class implements PostRepository {
                public function nextId(): PostId { return PostId::fromString('p-1'); }
                public function byId(PostId $id): ?Post { return null; }
                public function save(Post $post): void {}
            },
            new class implements TransactionManager {
                public function transactional(callable $callback): mixed { return $callback(); }
            },
            new class implements AuditLogRepository {
                public function save(AuditLog $auditLog): void {}
            },
        );

        $this->expectException(\InvalidArgumentException::class);
        $handler->handle(new CreatePostCommand('author-1', '   ', 'Body'));
    }
}
