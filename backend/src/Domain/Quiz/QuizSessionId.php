<?php
declare(strict_types=1);
namespace App\Domain\Quiz;
final class QuizSessionId { private function __construct(private string $value) {} public static function fromString(string $value): self { if ($value==='') throw new \InvalidArgumentException('Quiz id required'); return new self($value);} public static function new(): self { return new self('quiz-'.bin2hex(random_bytes(8))); } public function value(): string { return $this->value; }}
