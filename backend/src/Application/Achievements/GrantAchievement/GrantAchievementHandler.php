<?php
declare(strict_types=1);
namespace App\Application\Achievements\GrantAchievement;
use App\Domain\Achievements\UserAchievement;use App\Domain\Achievements\UserAchievementRepository;use App\Domain\Economy\Wallet;use App\Domain\Economy\WalletRepository;
final class GrantAchievementHandler { public function __construct(private UserAchievementRepository $achievements, private WalletRepository $wallets) {} public function handle(GrantAchievementCommand $c): bool { if($this->achievements->exists($c->userId,$c->key)) return false; $this->achievements->save(UserAchievement::grant($c->userId,$c->key)); $wallet=$this->wallets->byUserId($c->userId) ?? Wallet::create($c->userId); $wallet->addCoins($c->coinsReward); $this->wallets->save($wallet); return true; }}
