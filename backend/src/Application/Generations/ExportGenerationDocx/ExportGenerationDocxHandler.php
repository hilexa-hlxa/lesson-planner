<?php
declare(strict_types=1);
namespace App\Application\Generations\ExportGenerationDocx;
use App\Domain\Generations\GenerationId;use App\Domain\Generations\GenerationRepository;
final class ExportGenerationDocxHandler { public function __construct(private GenerationRepository $generations, private GenerationDocxExporter $exporter) {} public function handle(ExportGenerationDocxCommand $c): string { $g=$this->generations->byId(GenerationId::fromString($c->generationId)); if($g===null) throw new \DomainException('Generation not found'); return $this->exporter->export($g); }}
