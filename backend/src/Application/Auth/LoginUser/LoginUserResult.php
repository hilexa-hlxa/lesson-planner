<?php
declare(strict_types=1);
namespace App\Application\Auth\LoginUser;
final class LoginUserResult { public function __construct(public readonly string $userId) {} }
