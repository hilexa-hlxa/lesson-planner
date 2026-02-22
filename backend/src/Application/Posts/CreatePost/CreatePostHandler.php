<?php
declare(strict_types=1);
namespace App\Application\Posts\CreatePost;
use App\Application\Shared\TransactionManager;use App\Domain\Audit\AuditLog;use App\Domain\Audit\AuditLogRepository;use App\Domain\Auth\User\UserId;use App\Domain\Posts\Post\Post;use App\Domain\Posts\Post\PostRepository;
final class CreatePostHandler { public function __construct(private PostRepository $posts, private TransactionManager $tx, private AuditLogRepository $audit) {} public function handle(CreatePostCommand $command): CreatePostResult { return $this->tx->transactional(function () use ($command): CreatePostResult { $post = Post::create($this->posts->nextId(), UserId::fromString($command->authorId), $command->title, $command->body); $this->posts->save($post); foreach ($post->releaseDomainEvents() as $event) { $this->audit->save(AuditLog::fromDomainEvent($event)); } return new CreatePostResult($post->id()->value()); }); }}
