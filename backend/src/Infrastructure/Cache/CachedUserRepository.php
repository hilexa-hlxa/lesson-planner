<?php

declare(strict_types=1);

namespace App\Infrastructure\Cache;

use App\Domain\Auth\User\Email;
use App\Domain\Auth\User\PasswordHash;
use App\Domain\Auth\User\User;
use App\Domain\Auth\User\UserId;
use App\Domain\Auth\User\UserRepository;

final class CachedUserRepository implements UserRepository
{
    public function __construct(
        private UserRepository $inner,
        private RedisCache $cache,
        private int $ttlSeconds = 300,
    ) {
    }

    public function nextId(): UserId
    {
        return $this->inner->nextId();
    }

    public function byEmail(Email $email): ?User
    {
        $key = 'user:email:' . sha1($email->value());
        $cached = $this->cache->get($key);

        if ($cached !== null) {
            /** @var array{id:string,email:string,passwordHash:string,createdAt:string} $data */
            $data = json_decode($cached, true, 512, JSON_THROW_ON_ERROR);

            return User::reconstitute(
                UserId::fromString($data['id']),
                Email::fromString($data['email']),
                PasswordHash::fromHash($data['passwordHash']),
                new \DateTimeImmutable($data['createdAt']),
            );
        }

        $user = $this->inner->byEmail($email);

        if ($user !== null) {
            $payload = [
                'id' => $user->id()->value(),
                'email' => $user->email()->value(),
                'passwordHash' => $user->passwordHash()->value(),
                'createdAt' => $user->createdAt()->format(DATE_ATOM),
            ];

            $this->cache->set($key, json_encode($payload, JSON_THROW_ON_ERROR), $this->ttlSeconds);
        }

        return $user;
    }

    public function save(User $user): void
    {
        $this->inner->save($user);
        $this->cache->del('user:email:' . sha1($user->email()->value()));
    }
}
