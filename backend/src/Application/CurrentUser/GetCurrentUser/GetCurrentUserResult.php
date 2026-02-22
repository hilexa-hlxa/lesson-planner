<?php
declare(strict_types=1);
namespace App\Application\CurrentUser\GetCurrentUser;
final class GetCurrentUserResult { public function __construct(public string $userId, public string $email, public string $role) {} }
