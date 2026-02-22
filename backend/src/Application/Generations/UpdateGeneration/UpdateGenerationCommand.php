<?php
declare(strict_types=1);
namespace App\Application\Generations\UpdateGeneration;
final class UpdateGenerationCommand { public function __construct(public string $generationId, public ?string $status, public ?string $resultMd, public ?string $resultJson, public ?string $topic = null, public ?string $details = null) {} }
