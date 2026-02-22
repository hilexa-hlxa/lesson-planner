<?php
declare(strict_types=1);
namespace App\Application\Auth\RegisterUser;
final class RegisterUserResult { public function __construct(public readonly string $userId, public readonly string $email) {} }
