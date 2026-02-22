<?php
declare(strict_types=1);
namespace App\Domain\Posts\Post;
interface PostRepository { public function nextId(): PostId; public function byId(PostId $id): ?Post; public function save(Post $post): void; }
