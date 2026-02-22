<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Economy;
use App\Application\Economy\AddCoins\AddCoinsCommand;use App\Application\Economy\AddCoins\AddCoinsHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class AddCoinsController extends JsonController { public function __construct(private AddCoinsHandler $handler) {} public function __invoke(): void { try{$b=$this->requestJson(); if(!isset($b['userId'],$b['amount'])){ $this->json(400,['error'=>'userId and amount are required']); return; } $r=$this->handler->handle(new AddCoinsCommand((string)$b['userId'],(int)$b['amount'])); $this->json(200,['coins'=>$r->coins]); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);} }}
