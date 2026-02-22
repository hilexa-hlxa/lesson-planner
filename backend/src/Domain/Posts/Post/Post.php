<?php

declare(strict_types=1);

namespace App\Domain\Posts\Post;

use App\Domain\Auth\User\UserId;
use App\Domain\DomainEvent;

final class Post
{
    /** @var DomainEvent[] */
    private array $events = [];

    private function __construct(
        private PostId $id,
        private UserId $authorId,
        private string $title,
        private string $body,
        private \DateTimeImmutable $createdAt,
    ) {
    }

    public static function create(PostId $id, UserId $authorId, string $title, string $body): self
    {
        $normalizedTitle = trim($title);
        $normalizedBody = trim($body);

        if ($normalizedTitle == '') {
            throw new \InvalidArgumentException('Post title cannot be empty');
        }

        if ($normalizedBody == '') {
            throw new \InvalidArgumentException('Post body cannot be empty');
        }

        if (mb_strlen($normalizedTitle) > 200) {
            throw new \InvalidArgumentException('Post title is too long');
        }

        $post = new self(
            $id,
            $authorId,
            $normalizedTitle,
            $normalizedBody,
            new \DateTimeImmutable('now', new \DateTimeZone('UTC')),
        );

        $post->events[] = new PostCreated($id, $authorId, $post->title, $post->createdAt);

        return $post;
    }

    public static function reconstitute(PostId $id, UserId $authorId, string $title, string $body, \DateTimeImmutable $createdAt): self
    {
        return new self($id, $authorId, $title, $body, $createdAt);
    }

    public function id(): PostId { return $this->id; }
    public function authorId(): UserId { return $this->authorId; }
    public function title(): string { return $this->title; }
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
