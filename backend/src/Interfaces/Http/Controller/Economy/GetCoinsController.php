<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Economy;
use App\Application\Economy\GetCoins\GetCoinsCommand;use App\Application\Economy\GetCoins\GetCoinsHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class GetCoinsController extends JsonController { public function __construct(private GetCoinsHandler $handler) {} public function __invoke(): void { try{$userId=(string)($_SERVER['HTTP_X_USER_ID'] ?? $_GET['userId'] ?? ''); if($userId===''){ $this->json(400,['error'=>'X-User-Id is required']); return; } $r=$this->handler->handle(new GetCoinsCommand($userId)); $this->json(200,['coins'=>$r->coins]); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);} }}
