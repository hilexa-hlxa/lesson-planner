<?php
declare(strict_types=1);

$cfg = [
  'db' => [
    'dsn' => null,
    'user' => null,
    'pass' => null,
    'timeout' => 5,
  ],
  'auth' => [
    'cookie_name' => 'lp_session',
    'session_ttl_seconds' => 60 * 60 * 24 * 7,
    'cookie_secure' => false,
    'cookie_samesite' => 'Lax',
  ],
  'gemini' => [
    'api_key' => null,
    'model' => 'gemini-2.0-flash',
  ],
  'cache' => [
    'redis_host' => null,
    'redis_port' => 6379,
    'generation_ttl' => 900,
  ],
  'ssl' => [
   'cafile' => __DIR__ . '/extras/ssl/cacert.pem',
  ],
];

$local = __DIR__ . '/config.local.php';
if (is_file($local)) {
  $override = require $local;
  if (is_array($override)) {
    $cfg = array_replace_recursive($cfg, $override);
  }
}

$cfg['db']['dsn'] = $cfg['db']['dsn'] ?: (getenv('DB_DSN') ?: null);
$cfg['db']['user'] = $cfg['db']['user'] ?: (getenv('DB_USER') ?: null);
$cfg['db']['pass'] = $cfg['db']['pass'] ?: (getenv('DB_PASS') ?: null);
$cfg['db']['timeout'] = (int) ($cfg['db']['timeout'] ?: (getenv('DB_TIMEOUT') ?: 5));

$cfg['gemini']['api_key'] = $cfg['gemini']['api_key'] ?: (getenv('GEMINI_API_KEY') ?: null);
$cfg['gemini']['model'] = $cfg['gemini']['model'] ?: (getenv('GEMINI_MODEL') ?: 'gemini-2.0-flash');

$cfg['cache']['redis_host'] = $cfg['cache']['redis_host'] ?: (getenv('REDIS_HOST') ?: null);
$cfg['cache']['redis_port'] = (int) ($cfg['cache']['redis_port'] ?: (getenv('REDIS_PORT') ?: 6379));
$cfg['cache']['generation_ttl'] = (int) ($cfg['cache']['generation_ttl'] ?: (getenv('GENERATION_CACHE_TTL') ?: 900));

if (!$cfg['db']['dsn'] || !$cfg['db']['user'] || !$cfg['db']['pass']) {
  throw new RuntimeException(
    'Database config is not set. Provide in config.local.php or env vars: DB_DSN, DB_USER, DB_PASS'
  );
}

return $cfg;
