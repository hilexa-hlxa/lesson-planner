<?php

declare(strict_types=1);

namespace Tests\Unit\Application\Comments;

use App\Application\Comments\AddComment\AddCommentCommand;
use App\Application\Comments\AddComment\AddCommentHandler;
use App\Application\Shared\TransactionManager;
use App\Domain\Audit\AuditLog;
use App\Domain\Audit\AuditLogRepository;
use App\Domain\Comments\Comment\Comment;
use App\Domain\Comments\Comment\CommentId;
use App\Domain\Comments\Comment\CommentRepository;
use PHPUnit\Framework\TestCase;

final class AddCommentHandlerTest extends TestCase
{
    public function testAddsCommentAndWritesAuditLogInTransaction(): void
    {
        $comments = new class implements CommentRepository {
            public ?Comment $saved = null;
            public function nextId(): CommentId { return CommentId::fromString('c-1'); }
            public function save(Comment $comment): void { $this->saved = $comment; }
        };

        $audit = new class implements AuditLogRepository {
            public array $saved = [];
            public function save(AuditLog $auditLog): void { $this->saved[] = $auditLog; }
        };

        $tx = new class implements TransactionManager {
            public bool $called = false;
            public function transactional(callable $callback): mixed { $this->called = true; return $callback(); }
        };

        $handler = new AddCommentHandler($comments, $tx, $audit);
        $result = $handler->handle(new AddCommentCommand('p-1', 'u-1', 'Hello'));

        self::assertSame('c-1', $result->commentId);
        self::assertNotNull($comments->saved);
        self::assertCount(1, $audit->saved);
        self::assertTrue($tx->called);
    }
}
