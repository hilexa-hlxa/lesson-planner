<?php

declare(strict_types=1);

namespace App\Infrastructure\Cache;

use App\Domain\Auth\User\UserId;
use App\Domain\Posts\Post\Post;
use App\Domain\Posts\Post\PostId;
use App\Domain\Posts\Post\PostRepository;

final class CachedPostRepository implements PostRepository
{
    public function __construct(
        private PostRepository $inner,
        private RedisCache $cache,
        private int $ttlSeconds = 300,
    ) {
    }

    public function nextId(): PostId
    {
        return $this->inner->nextId();
    }

    public function byId(PostId $id): ?Post
    {
        $key = 'post:' . $id->value();
        $cached = $this->cache->get($key);

        if ($cached !== null) {
            /** @var array{id:string,authorId:string,title:string,body:string,createdAt:string} $data */
            $data = json_decode($cached, true, 512, JSON_THROW_ON_ERROR);

            return Post::reconstitute(
                PostId::fromString($data['id']),
                UserId::fromString($data['authorId']),
                $data['title'],
                $data['body'],
                new \DateTimeImmutable($data['createdAt']),
            );
        }

        $post = $this->inner->byId($id);

        if ($post !== null) {
            $payload = [
                'id' => $post->id()->value(),
                'authorId' => $post->authorId()->value(),
                'title' => $post->title(),
                'body' => $post->body(),
                'createdAt' => $post->createdAt()->format(DATE_ATOM),
            ];

            $this->cache->set($key, json_encode($payload, JSON_THROW_ON_ERROR), $this->ttlSeconds);
        }

        return $post;
    }

    public function save(Post $post): void
    {
        $this->inner->save($post);
        $this->cache->del('post:' . $post->id()->value());
    }
}
