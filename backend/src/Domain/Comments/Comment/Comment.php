<?php

declare(strict_types=1);

namespace App\Domain\Comments\Comment;

use App\Domain\Auth\User\UserId;
use App\Domain\DomainEvent;
use App\Domain\Posts\Post\PostId;

final class Comment
{
    /** @var DomainEvent[] */
    private array $events = [];

    private function __construct(
        private CommentId $id,
        private PostId $postId,
        private UserId $authorId,
        private string $body,
        private \DateTimeImmutable $createdAt,
    ) {
    }

    public static function add(CommentId $id, PostId $postId, UserId $authorId, string $body): self
    {
        $normalizedBody = trim($body);
        if ($normalizedBody === '') {
            throw new \InvalidArgumentException('Comment body cannot be empty');
        }

        $comment = new self(
            $id,
            $postId,
            $authorId,
            $normalizedBody,
            new \DateTimeImmutable('now', new \DateTimeZone('UTC')),
        );

        $comment->events[] = new CommentAdded($id, $postId, $authorId, $comment->createdAt);

        return $comment;
    }

    public static function reconstitute(CommentId $id, PostId $postId, UserId $authorId, string $body, \DateTimeImmutable $createdAt): self
    {
        return new self($id, $postId, $authorId, $body, $createdAt);
    }

    public function id(): CommentId { return $this->id; }
    public function postId(): PostId { return $this->postId; }
    public function authorId(): UserId { return $this->authorId; }
    public function body(): string { return $this->body; }
    public function createdAt(): \DateTimeImmutable { return $this->createdAt; }

    /** @return DomainEvent[] */
    public function releaseDomainEvents(): array
    {
        $events = $this->events;
        $this->events = [];

        return $events;
    }
}
