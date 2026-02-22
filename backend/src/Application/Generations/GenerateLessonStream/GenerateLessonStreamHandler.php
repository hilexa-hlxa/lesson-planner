<?php
declare(strict_types=1);
namespace App\Application\Generations\GenerateLessonStream;
final class GenerateLessonStreamHandler { public function __construct(private GeminiClient $gemini) {} public function handle(GenerateLessonStreamCommand $c): string { return $this->gemini->generate($c->prompt); }}
