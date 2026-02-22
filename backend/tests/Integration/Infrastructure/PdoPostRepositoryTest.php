<?php

declare(strict_types=1);

namespace Tests\Integration\Infrastructure;

use App\Domain\Auth\User\UserId;
use App\Domain\Posts\Post\Post;
use App\Domain\Posts\Post\PostId;
use App\Infrastructure\Persistence\PDO\PdoPostRepository;
use PDO;
use PHPUnit\Framework\TestCase;

final class PdoPostRepositoryTest extends TestCase
{
    public function testRoundTrip(): void
    {
        $pdo = new PDO('sqlite::memory:');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec('CREATE TABLE posts (id TEXT PRIMARY KEY, author_id TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL)');

        $repo = new PdoPostRepository($pdo);

        $post = Post::create(PostId::fromString('p-1'), UserId::fromString('u-1'), 'Title', 'Body');
        $repo->save($post);

        $loaded = $repo->byId(PostId::fromString('p-1'));
        self::assertNotNull($loaded);
        self::assertSame('p-1', $loaded->id()->value());
        self::assertSame('Title', $loaded->title());
        self::assertSame('Body', $loaded->body());
    }
}
