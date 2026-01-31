<?php
declare(strict_types=1);

$cfg = [
  'db' => [
    'dsn'  => null,
    'user' => null,
    'pass' => null,
  ],
  'auth' => [
    'cookie_name' => 'lp_session',
    'session_ttl_seconds' => 60 * 60 * 24 * 7,
    'cookie_secure' => false,     // true на https
    'cookie_samesite' => 'Lax',
  ],
  'gemini' => [
    'api_key' => null,
    'model'   => 'gemini-2.0-flash',
  ],
  'ssl' => [
   'cafile' => __DIR__ . '/extras/ssl/cacert.pem',
  ],
];

// 1) local override (секреты здесь)
$local = __DIR__ . '/config.local.php';
if (is_file($local)) {
  $override = require $local;
  if (is_array($override)) {
    $cfg = array_replace_recursive($cfg, $override);
  }
}

// 2) env fallback (если в local нет — берём из env)
$cfg['db']['dsn']  = $cfg['db']['dsn']  ?: (getenv('DB_DSN')  ?: null);
$cfg['db']['user'] = $cfg['db']['user'] ?: (getenv('DB_USER') ?: null);
$cfg['db']['pass'] = $cfg['db']['pass'] ?: (getenv('DB_PASS') ?: null);

$cfg['gemini']['api_key'] = $cfg['gemini']['api_key'] ?: (getenv('GEMINI_API_KEY') ?: null);
$cfg['gemini']['model']   = $cfg['gemini']['model']   ?: (getenv('GEMINI_MODEL') ?: 'gemini-2.0-flash');

// 3) validate DB (строго обязательно)
if (!$cfg['db']['dsn'] || !$cfg['db']['user'] || !$cfg['db']['pass']) {
  throw new RuntimeException(
    'Database config is not set. Provide in config.local.php or env vars: DB_DSN, DB_USER, DB_PASS'
  );
}

return $cfg;
