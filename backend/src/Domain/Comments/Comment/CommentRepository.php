<?php
declare(strict_types=1);
namespace App\Domain\Comments\Comment;
interface CommentRepository { public function nextId(): CommentId; public function save(Comment $comment): void; }
