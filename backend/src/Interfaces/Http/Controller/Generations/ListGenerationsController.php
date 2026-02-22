<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Generations;
use App\Application\Generations\ListGenerations\ListGenerationsCommand;use App\Application\Generations\ListGenerations\ListGenerationsHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class ListGenerationsController extends JsonController { public function __construct(private ListGenerationsHandler $handler) {} public function __invoke(): void { try{ $userId=(string)($_GET['userId'] ?? $_SERVER['HTTP_X_USER_ID'] ?? ''); if($userId===''){ $this->json(400,['error'=>'userId is required']); return; } $r=$this->handler->handle(new ListGenerationsCommand($userId)); $this->json(200,['items'=>$r->items]); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);} }}
