<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller;
use App\Application\Posts\CreatePost\CreatePostCommand;use App\Application\Posts\CreatePost\CreatePostHandler;use App\Interfaces\Http\Support\ErrorMapper;
final class CreatePostController extends JsonController { public function __construct(private CreatePostHandler $handler) {} public function __invoke(): void { try { $body=$this->requestJson(); if (!isset($body['authorId'],$body['title'],$body['body'])) { $this->json(400,['error'=>'authorId, title and body are required']); return; } $result=$this->handler->handle(new CreatePostCommand((string)$body['authorId'],(string)$body['title'],(string)$body['body'])); $this->json(201,['postId'=>$result->postId]); } catch (\Throwable $e) { [$s,$m]=ErrorMapper::map($e); $this->json($s,['error'=>$m]); } }}
