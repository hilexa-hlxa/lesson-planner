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

        // Постоянные соединения выключены намеренно. Supabase работает через
        // transaction pooler, который сам закрывает простаивающие соединения:
        // воркер PHP продолжал держать мёртвый дескриптор и отдавал 500
        // ("SSL SYSCALL error: EOF detected") на каждый запрос, пока не
        // перезапустится. Пул на то и пул — соединение на запрос дешёвое.
        \PDO::ATTR_PERSISTENT => false,

        // Нужно для transaction pooler: он не держит серверные prepared statements
        \PDO::ATTR_EMULATE_PREPARES => true,
      ]
    );
  }

  public function pdo(): \PDO { return $this->pdo; }
}
