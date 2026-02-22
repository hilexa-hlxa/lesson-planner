<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Generations;
use App\Application\Generations\UpdateGeneration\UpdateGenerationCommand;use App\Application\Generations\UpdateGeneration\UpdateGenerationHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class UpdateGenerationController extends JsonController { public function __construct(private UpdateGenerationHandler $handler) {} public function __invoke(string $id): void { try{$b=$this->requestJson(); $this->handler->handle(new UpdateGenerationCommand($id,$b['status']??null,$b['resultMd']??null,$b['resultJson']??null,$b['topic']??null,$b['details']??null)); $this->json(200,['ok'=>true]); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);} }}
