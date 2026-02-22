<?php
declare(strict_types=1);
namespace App\Application\Generations\DeleteGeneration;
final class DeleteGenerationCommand { public function __construct(public string $generationId) {} }
