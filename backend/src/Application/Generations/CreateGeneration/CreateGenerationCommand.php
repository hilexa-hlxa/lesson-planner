<?php
declare(strict_types=1);
namespace App\Application\Generations\CreateGeneration;
final class CreateGenerationCommand { public function __construct(public string $userId, public string $subject, public string $topic, public string $details, public string $grade, public int $duration, public string $lang, public string $prompt) {} }
