<?php
declare(strict_types=1);

$dbDsn  = getenv('DB_DSN');
$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASS');

if (!$dbDsn || !$dbUser || !$dbPass) {
  throw new RuntimeException(
    'Database env vars are not set. Required: DB_DSN, DB_USER, DB_PASS'
  );
}

return [
  'db' => [
    'dsn'  => $dbDsn,
    'user' => $dbUser,
    'pass' => $dbPass,
  ],
  'auth' => [
    'cookie_name' => 'lp_session',
    'session_ttl_seconds' => 60 * 60 * 24 * 7,
    'cookie_secure' => false,     // true на https
    'cookie_samesite' => 'Lax',
  ],
];
