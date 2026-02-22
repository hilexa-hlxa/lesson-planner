<?php
declare(strict_types=1);
namespace App\Application\Economy\GetCoins;
final class GetCoinsCommand { public function __construct(public string $userId) {} }
