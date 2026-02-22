<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controller\Auth;

use App\Application\Auth\LoginUser\LoginUserCommand;
use App\Application\Auth\LoginUser\LoginUserHandler;
use App\Interfaces\Http\Controller\JsonController;
use App\Interfaces\Http\Support\ErrorMapper;

final class LoginUserController extends JsonController
{
    public function __construct(private LoginUserHandler $handler)
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

            $result = $this->handler->handle(new LoginUserCommand((string) $body['email'], (string) $body['password']));
            $this->json(200, ['userId' => $result->userId]);
        } catch (\Throwable $e) {
            [$status, $error] = ErrorMapper::map($e);
            $this->json($status, ['error' => $error]);
        }
    }
}
