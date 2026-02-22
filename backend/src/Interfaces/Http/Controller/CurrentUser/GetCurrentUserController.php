<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controller\CurrentUser;

use App\Domain\Auth\User\Email;
use App\Domain\Auth\User\UserRepository;
use App\Interfaces\Http\Controller\JsonController;
use App\Interfaces\Http\Support\ErrorMapper;

final class GetCurrentUserController extends JsonController
{
    public function __construct(private UserRepository $users)
    {
    }

    public function __invoke(): void
    {
        try {
            $identity = (string) ($_SERVER['HTTP_X_USER_ID'] ?? '');
            if ($identity === '') {
                $this->json(401, ['error' => 'X-User-Id is required']);

                return;
            }

            if (!str_contains($identity, '@')) {
                $this->json(400, ['error' => 'Current implementation expects X-User-Id to be email']);

                return;
            }

            $user = $this->users->byEmail(Email::fromString($identity));
            if ($user === null) {
                $this->json(404, ['error' => 'User not found']);

                return;
            }

            $this->json(200, [
                'user' => [
                    'id' => $user->id()->value(),
                    'email' => $user->email()->value(),
                    'role' => 'user',
                    'coins' => 0,
                    'achievements' => [],
                ],
            ]);
        } catch (\Throwable $e) {
            [$status, $error] = ErrorMapper::map($e);
            $this->json($status, ['error' => $error]);
        }
    }
}
