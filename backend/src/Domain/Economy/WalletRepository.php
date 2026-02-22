<?php
declare(strict_types=1);
namespace App\Domain\Economy;
interface WalletRepository { public function byUserId(string $userId): ?Wallet; public function save(Wallet $wallet): void; }
