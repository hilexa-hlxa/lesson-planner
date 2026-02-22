<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Generations;
use App\Application\Generations\DeleteGeneration\DeleteGenerationCommand;use App\Application\Generations\DeleteGeneration\DeleteGenerationHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class DeleteGenerationController extends JsonController { public function __construct(private DeleteGenerationHandler $handler) {} public function __invoke(string $id): void { try{$this->handler->handle(new DeleteGenerationCommand($id)); $this->json(200,['ok'=>true]); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);} }}
