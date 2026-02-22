<?php

declare(strict_types=1);

namespace App\Domain\Comments\Comment;

use App\Domain\Auth\User\UserId;
use App\Domain\DomainEvent;
use App\Domain\Posts\Post\PostId;

final class CommentAdded implements DomainEvent
{
    public function __construct(
        public readonly CommentId $commentId,
        public readonly PostId $postId,
        public readonly UserId $authorId,
        private \DateTimeImmutable $occurredOn,
    ) {
    }

    public function occurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }
}
