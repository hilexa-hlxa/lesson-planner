<?php

declare(strict_types=1);

namespace App\Domain\Posts\Post;

use App\Domain\Auth\User\UserId;
use App\Domain\DomainEvent;

final class PostCreated implements DomainEvent
{
    public function __construct(
        public readonly PostId $postId,
        public readonly UserId $authorId,
        public readonly string $title,
        private \DateTimeImmutable $occurredOn,
    ) {
    }

    public function occurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }
}
