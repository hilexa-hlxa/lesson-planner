<?php

declare(strict_types=1);

namespace App\Application\Comments\AddComment;

use App\Application\Shared\TransactionManager;
use App\Domain\Audit\AuditLog;
use App\Domain\Audit\AuditLogRepository;
use App\Domain\Auth\User\UserId;
use App\Domain\Comments\Comment\Comment;
use App\Domain\Comments\Comment\CommentRepository;
use App\Domain\Posts\Post\PostId;

final class AddCommentHandler
{
    public function __construct(
        private CommentRepository $comments,
        private TransactionManager $tx,
        private AuditLogRepository $audit,
    ) {
    }

    public function handle(AddCommentCommand $command): AddCommentResult
    {
        return $this->tx->transactional(function () use ($command): AddCommentResult {
            $comment = Comment::add(
                $this->comments->nextId(),
                PostId::fromString($command->postId),
                UserId::fromString($command->authorId),
                $command->body,
            );

            $this->comments->save($comment);

            foreach ($comment->releaseDomainEvents() as $event) {
                $this->audit->save(AuditLog::fromDomainEvent($event));
            }

            return new AddCommentResult($comment->id()->value());
        });
    }
}
