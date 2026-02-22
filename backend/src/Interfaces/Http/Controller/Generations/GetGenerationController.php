<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Generations;
use App\Application\Generations\GetGeneration\GetGenerationCommand;use App\Application\Generations\GetGeneration\GetGenerationHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class GetGenerationController extends JsonController { public function __construct(private GetGenerationHandler $handler) {} public function __invoke(string $id): void { try{$r=$this->handler->handle(new GetGenerationCommand($id)); $this->json(200,$r->data);}catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);}}}
