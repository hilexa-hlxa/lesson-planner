<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Generations;
use App\Application\Generations\GenerateLessonStream\GenerateLessonStreamCommand;use App\Application\Generations\GenerateLessonStream\GenerateLessonStreamHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class GenerateLessonStreamController extends JsonController { public function __construct(private GenerateLessonStreamHandler $handler) {} public function __invoke(): void { try{$b=$this->requestJson(); $prompt=(string)($b['prompt']??''); if($prompt===''){ $this->json(400,['error'=>'prompt is required']); return; } $this->json(200,['markdown'=>$this->handler->handle(new GenerateLessonStreamCommand($prompt))]); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);} }}
