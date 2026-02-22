<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller;
use App\Application\Comments\AddComment\AddCommentCommand;use App\Application\Comments\AddComment\AddCommentHandler;use App\Interfaces\Http\Support\ErrorMapper;
final class AddCommentController extends JsonController { public function __construct(private AddCommentHandler $handler) {} public function __invoke(): void { try { $body=$this->requestJson(); if (!isset($body['postId'],$body['authorId'],$body['body'])) { $this->json(400,['error'=>'postId, authorId and body are required']); return; } $result=$this->handler->handle(new AddCommentCommand((string)$body['postId'],(string)$body['authorId'],(string)$body['body'])); $this->json(201,['commentId'=>$result->commentId]); } catch (\Throwable $e) { [$s,$m]=ErrorMapper::map($e); $this->json($s,['error'=>$m]); } }}
