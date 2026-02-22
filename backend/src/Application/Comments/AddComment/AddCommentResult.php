<?php
declare(strict_types=1);
namespace App\Application\Comments\AddComment;
final class AddCommentResult { public function __construct(public readonly string $commentId) {} }
