<?php
declare(strict_types=1);
namespace App\Application\Economy\AddCoins;
final class AddCoinsCommand { public function __construct(public string $userId, public int $amount) {} }
