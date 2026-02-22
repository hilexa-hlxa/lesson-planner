<?php
declare(strict_types=1);
namespace App\Application\Economy\AddCoins;
use App\Domain\Economy\Wallet;use App\Domain\Economy\WalletRepository;
final class AddCoinsHandler { public function __construct(private WalletRepository $wallets) {} public function handle(AddCoinsCommand $c): AddCoinsResult { if($c->amount<=0) throw new \DomainException('Amount must be positive'); $w=$this->wallets->byUserId($c->userId) ?? Wallet::create($c->userId); $w->addCoins($c->amount); $this->wallets->save($w); return new AddCoinsResult($w->coins()); }}
