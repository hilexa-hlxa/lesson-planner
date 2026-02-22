<?php
declare(strict_types=1);
namespace App\Application\Generations\DeleteGeneration;
use App\Domain\Generations\GenerationId;use App\Domain\Generations\GenerationRepository;
final class DeleteGenerationHandler { public function __construct(private GenerationRepository $generations) {} public function handle(DeleteGenerationCommand $c): void { $this->generations->delete(GenerationId::fromString($c->generationId)); }}
