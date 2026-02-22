<?php
declare(strict_types=1);
namespace App\Application\Posts\CreatePost;
final class CreatePostResult { public function __construct(public readonly string $postId) {} }
