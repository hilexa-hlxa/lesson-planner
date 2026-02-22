<?php

declare(strict_types=1);

namespace App\Domain\Audit;

use App\Domain\Auth\User\UserRegistered;
use App\Domain\Comments\Comment\CommentAdded;
use App\Domain\DomainEvent;
use App\Domain\Groups\Group\GroupCreated;
use App\Domain\Posts\Post\PostCreated;

final class AuditLog
{
    private function __construct(
        private string $id,
        private string $eventName,
        private string $payload,
        private \DateTimeImmutable $createdAt,
    ) {
    }

    public static function fromDomainEvent(DomainEvent $event): self
    {
        $payload = [
            'userId' => null,
            'postId' => null,
            'authorId' => null,
            'title' => null,
            'commentId' => null,
            'groupId' => null,
            'occurredOn' => $event->occurredOn()->format(DATE_ATOM),
        ];

        if ($event instanceof UserRegistered) {
            $payload['userId'] = $event->userId->value();
        }

        if ($event instanceof PostCreated) {
            $payload['postId'] = $event->postId->value();
            $payload['authorId'] = $event->authorId->value();
            $payload['title'] = $event->title;
        }

        if ($event instanceof CommentAdded) {
            $payload['commentId'] = $event->commentId->value();
            $payload['postId'] = $event->postId->value();
            $payload['authorId'] = $event->authorId->value();
        }

        if ($event instanceof GroupCreated) {
            $payload['groupId'] = $event->groupId->value();
        }

        return new self(
            bin2hex(random_bytes(16)),
            $event::class,
            json_encode($payload, JSON_THROW_ON_ERROR),
            new \DateTimeImmutable('now', new \DateTimeZone('UTC')),
        );
    }

    public function id(): string { return $this->id; }
    public function eventName(): string { return $this->eventName; }
    public function payload(): string { return $this->payload; }
    public function createdAt(): \DateTimeImmutable { return $this->createdAt; }
}
