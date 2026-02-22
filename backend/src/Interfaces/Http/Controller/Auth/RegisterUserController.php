<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controller\Auth;

use App\Application\Auth\RegisterUser\RegisterUserCommand;
use App\Application\Auth\RegisterUser\RegisterUserHandler;
use App\Interfaces\Http\Controller\JsonController;
use App\Interfaces\Http\Support\ErrorMapper;

final class RegisterUserController extends JsonController
{
    public function __construct(private RegisterUserHandler $handler)
    {
    }

    public function __invoke(): void
    {
        try {
            $body = $this->requestJson();
            if (!isset($body['email'], $body['password'])) {
                $this->json(400, ['error' => 'email and password are required']);

                return;
            }

            $result = $this->handler->handle(new RegisterUserCommand((string) $body['email'], (string) $body['password']));
            $this->json(201, ['userId' => $result->userId, 'email' => $result->email]);
        } catch (\Throwable $e) {
            [$status, $error] = ErrorMapper::map($e);
            $this->json($status, ['error' => $error]);
        }
    }
}
