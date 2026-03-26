<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controller\CurrentUser;

use App\Domain\Achievements\UserAchievementRepository;
use App\Domain\Auth\User\Email;
use App\Domain\Auth\User\UserRepository;
use App\Domain\Economy\WalletRepository;
use App\Interfaces\Http\Controller\JsonController;
use App\Interfaces\Http\Support\ErrorMapper;

final class GetCurrentUserController extends JsonController
{
    public function __construct(
        private UserRepository $users,
        private WalletRepository $wallets,
        private UserAchievementRepository $achievements,
    ) {
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

            $userId = $user->id()->value();
            $wallet = $this->wallets->byUserId($userId);
            $coins = $wallet !== null ? $wallet->coins() : 0;

            $achievementKeys = array_map(
                fn($a) => $a->key(),
                $this->achievements->listByUser($userId),
            );

            $this->json(200, [
                'user' => [
                    'id' => $userId,
                    'email' => $user->email()->value(),
                    'role' => 'user',
                    'coins' => $coins,
                    'achievements' => $achievementKeys,
                ],
            ]);
        } catch (\Throwable $e) {
            [$status, $error] = ErrorMapper::map($e);
            $this->json($status, ['error' => $error]);
        }
    }
}
