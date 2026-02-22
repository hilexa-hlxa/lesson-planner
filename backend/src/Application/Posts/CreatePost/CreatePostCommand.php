<?php
declare(strict_types=1);
namespace App\Application\Posts\CreatePost;
final class CreatePostCommand { public function __construct(public readonly string $authorId, public readonly string $title, public readonly string $body) {} }
