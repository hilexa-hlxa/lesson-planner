<?php
declare(strict_types=1);
namespace App\Application\Generations\ExportGenerationDocx;
use App\Domain\Generations\Generation;
interface GenerationDocxExporter { public function export(Generation $generation): string; }
