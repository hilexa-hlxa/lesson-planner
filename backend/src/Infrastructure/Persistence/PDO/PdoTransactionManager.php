<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\PDO;

use App\Application\Shared\TransactionManager;
use PDO;

final class PdoTransactionManager implements TransactionManager
{
    public function __construct(private PDO $pdo)
    {
    }

    public function transactional(callable $callback): mixed
    {
        $startedHere = false;

        if (!$this->pdo->inTransaction()) {
            $this->pdo->beginTransaction();
            $startedHere = true;
        }

        try {
            $result = $callback();

            if ($startedHere && $this->pdo->inTransaction()) {
                $this->pdo->commit();
            }

            return $result;
        } catch (\Throwable $e) {
            if ($startedHere && $this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }

            throw $e;
        }
    }
}
