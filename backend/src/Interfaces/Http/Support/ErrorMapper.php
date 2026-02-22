<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Support;
use App\Domain\Auth\User\InvalidCredentials;use App\Domain\Auth\User\UserAlreadyExists;
final class ErrorMapper { public static function map(\Throwable $e): array { return match (true) { $e instanceof \InvalidArgumentException, $e instanceof \DomainException => [400, $e->getMessage()], $e instanceof UserAlreadyExists => [409, $e->getMessage()], $e instanceof InvalidCredentials => [401, $e->getMessage()], default => [500, 'Internal server error'], }; }}
