<?php
declare(strict_types=1);
namespace App\Application\CurrentUser\GetCurrentUser;
final class GetCurrentUserCommand { public function __construct(public string $userId) {} }
