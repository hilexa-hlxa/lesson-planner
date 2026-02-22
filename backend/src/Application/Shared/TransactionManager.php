<?php
declare(strict_types=1);
namespace App\Application\Shared;
interface TransactionManager { public function transactional(callable $callback): mixed; }
