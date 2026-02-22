<?php
declare(strict_types=1);
namespace App\Application\Economy\GetCoins;
use App\Domain\Economy\Wallet;use App\Domain\Economy\WalletRepository;
final class GetCoinsHandler { public function __construct(private WalletRepository $wallets) {} public function handle(GetCoinsCommand $c): GetCoinsResult { $w=$this->wallets->byUserId($c->userId) ?? Wallet::create($c->userId); return new GetCoinsResult($w->coins()); }}
