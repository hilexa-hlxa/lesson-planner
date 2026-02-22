<?php
declare(strict_types=1);
namespace App\Application\Generations\GenerateLessonStream;
interface GeminiClient { public function generate(string $prompt): string; }
