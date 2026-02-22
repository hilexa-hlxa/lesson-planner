<?php
declare(strict_types=1);
namespace App\Domain\Quiz;
final class QuizResultId { private function __construct(private string $value) {} public static function new(): self { return new self('qzr-'.bin2hex(random_bytes(8))); } public static function fromString(string $value): self { if ($value==='') throw new \InvalidArgumentException('Quiz result id required'); return new self($value);} public function value(): string { return $this->value; }}
