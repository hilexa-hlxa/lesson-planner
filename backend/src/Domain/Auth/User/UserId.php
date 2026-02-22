<?php
declare(strict_types=1);

namespace App\Domain\Auth\User;

final class UserId
{
    private function __construct(private string $value) {}
    public static function new(): self { return new self(bin2hex(random_bytes(16))); }
    public static function fromString(string $value): self { if ($value === '') { throw new \InvalidArgumentException('Empty id'); } return new self($value); }
    public function value(): string { return $this->value; }
}
