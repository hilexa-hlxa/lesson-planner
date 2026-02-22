<?php
declare(strict_types=1);

namespace App\Domain\Auth\User;

final class Email
{
    private function __construct(private string $value)
    {
    }

    public static function fromString(string $value): self
    {
        $email = mb_strtolower(trim($value));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidEmail('Invalid email');
        }

        return new self($email);
    }

    public function value(): string
    {
        return $this->value;
    }
}
