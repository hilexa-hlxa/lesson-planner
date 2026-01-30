<?php
declare(strict_types=1);

final class DB {
  private \PDO $pdo;

  public function __construct(array $cfg) {
    $this->pdo = new \PDO(
      $cfg['dsn'],
      $cfg['user'],
      $cfg['pass'],
      [
        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,

        \PDO::ATTR_PERSISTENT => true,

        \PDO::ATTR_EMULATE_PREPARES => true,
      ]
    );
  }

  public function pdo(): \PDO { return $this->pdo; }
}
