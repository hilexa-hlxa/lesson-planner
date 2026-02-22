<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Achievements;
use App\Application\Achievements\GrantAchievement\GrantAchievementCommand;use App\Application\Achievements\GrantAchievement\GrantAchievementHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class GrantAchievementController extends JsonController { public function __construct(private GrantAchievementHandler $handler) {} public function __invoke(): void { try{$b=$this->requestJson(); if(!isset($b['userId'],$b['key'])){ $this->json(400,['error'=>'userId and key are required']); return; } $created=$this->handler->handle(new GrantAchievementCommand((string)$b['userId'],(string)$b['key'],(int)($b['coinsReward'] ?? 5))); $this->json($created?201:200,['created'=>$created]); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);} }}
