<?php
declare(strict_types=1);
namespace App\Application\Comments\AddComment;
final class AddCommentCommand { public function __construct(public readonly string $postId, public readonly string $authorId, public readonly string $body) {} }
