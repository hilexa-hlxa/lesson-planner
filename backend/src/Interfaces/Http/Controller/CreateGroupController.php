<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller;
use App\Application\Groups\CreateGroup\CreateGroupCommand;use App\Application\Groups\CreateGroup\CreateGroupHandler;use App\Interfaces\Http\Support\ErrorMapper;
final class CreateGroupController extends JsonController { public function __construct(private CreateGroupHandler $handler) {} public function __invoke(): void { try { $body=$this->requestJson(); if (!isset($body['ownerId'],$body['name'])) { $this->json(400,['error'=>'ownerId and name are required']); return; } $result=$this->handler->handle(new CreateGroupCommand((string)$body['ownerId'],(string)$body['name'])); $this->json(201,['groupId'=>$result->groupId]); } catch (\Throwable $e) { [$s,$m]=ErrorMapper::map($e); $this->json($s,['error'=>$m]); } }}
