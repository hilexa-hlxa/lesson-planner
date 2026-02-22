<?php
declare(strict_types=1);
namespace App\Infrastructure\Persistence\PDO;
use App\Domain\Comments\Comment\Comment;use App\Domain\Comments\Comment\CommentId;use App\Domain\Comments\Comment\CommentRepository;use PDO;
final class PdoCommentRepository implements CommentRepository { public function __construct(private PDO $pdo) {} public function nextId(): CommentId { return CommentId::new(); } public function save(Comment $comment): void { $stmt=$this->pdo->prepare('INSERT INTO comments (id, post_id, author_id, body, created_at) VALUES (:id,:post,:author,:body,:created)'); $stmt->execute(['id'=>$comment->id()->value(),'post'=>$comment->postId()->value(),'author'=>$comment->authorId()->value(),'body'=>$comment->body(),'created'=>$comment->createdAt()->format('Y-m-d H:i:s')]); }}
