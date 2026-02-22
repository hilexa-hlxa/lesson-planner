<?php
declare(strict_types=1);
namespace App\Domain\Groups\Group;
final class GroupId { private function __construct(private string $value) {} public static function new(): self { return new self(bin2hex(random_bytes(16))); } public static function fromString(string $value): self { return new self($value); } public function value(): string { return $this->value; }}
