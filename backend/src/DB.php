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

        // Раньше здесь стояло false: DB_DSN шёл через transaction pooler
        // (порт 6543), который сам закрывает простаивающие соединения между
        // транзакциями — постоянное PHP-соединение переживало сервер и
        // отдавало 500 ("SSL SYSCALL error: EOF detected") на каждый запрос,
        // пока воркер не перезапустится. А без ATTR_PERSISTENT каждый запрос
        // платил ~2с за новый TCP+TLS+auth хендшейк до Supabase в Мумбаи —
        // именно поэтому всё в приложении казалось медленным.
        // Теперь DB_DSN указывает на session pooler (порт 5432) — он держит
        // выделенное соединение на сессию и безопасен для ATTR_PERSISTENT:
        // PHP переиспользует то же TCP-соединение между запросами в рамках
        // одного воркера вместо хендшейка на каждый запрос.
        \PDO::ATTR_PERSISTENT => true,

        // Нужно для pgbouncer-пулеров (и transaction, и session mode):
        // они не держат серверные prepared statements между использованиями.
        \PDO::ATTR_EMULATE_PREPARES => true,
      ]
    );
  }

  public function pdo(): \PDO { return $this->pdo; }
}
