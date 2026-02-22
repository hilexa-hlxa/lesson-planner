<?php
declare(strict_types=1);
namespace App\Infrastructure\Persistence\PDO;
use App\Domain\Economy\Wallet;use App\Domain\Economy\WalletRepository;use PDO;
final class PdoWalletRepository implements WalletRepository { public function __construct(private PDO $pdo) {} public function byUserId(string $userId): ?Wallet { $st=$this->pdo->prepare('SELECT * FROM wallets WHERE user_id=:id'); $st->execute(['id'=>$userId]); $row=$st->fetch(); return $row===false?null:Wallet::create((string)$row['user_id'],(int)$row['coins']); } public function save(Wallet $wallet): void { $st=$this->pdo->prepare('INSERT INTO wallets (user_id,coins) VALUES (:id,:coins) ON CONFLICT(user_id) DO UPDATE SET coins=excluded.coins'); $st->execute(['id'=>$wallet->userId(),'coins'=>$wallet->coins()]); }}
