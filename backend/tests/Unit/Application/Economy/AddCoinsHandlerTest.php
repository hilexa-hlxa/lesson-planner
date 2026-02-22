<?php
declare(strict_types=1);
namespace Tests\Unit\Application\Economy;
use App\Application\Economy\AddCoins\AddCoinsCommand;use App\Application\Economy\AddCoins\AddCoinsHandler;use App\Domain\Economy\Wallet;use App\Domain\Economy\WalletRepository;use PHPUnit\Framework\TestCase;
final class AddCoinsHandlerTest extends TestCase { public function testRejectsNonPositiveAmount(): void { $h=new AddCoinsHandler(new class implements WalletRepository { public function byUserId(string $userId): ?Wallet { return Wallet::create($userId,10); } public function save(Wallet $wallet): void {} }); $this->expectException(\DomainException::class); $h->handle(new AddCoinsCommand('u-1',0)); }}
