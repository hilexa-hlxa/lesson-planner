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
    // null = определить по запросу (см. ниже). Явные true/false тоже работают.
    'cookie_secure' => null,
    'cookie_samesite' => 'Lax',
  ],
  // Groq — единственный провайдер генерации (осознанное решение: работаем
  // только на бесплатных ключах Groq, без Gemini как запасного — см.
  // GenerateStream::handle и ROADMAP.md).
  'groq' => [
    'api_key' => null,
    'model'   => 'openai/gpt-oss-120b',
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

$cfg['groq']['api_key'] = $cfg['groq']['api_key'] ?: (getenv('GROQ_API_KEY') ?: null);
$cfg['groq']['model']   = $cfg['groq']['model']   ?: (getenv('GROQ_MODEL') ?: 'openai/gpt-oss-120b');

// 3) Флаг Secure у cookie сессии.
// Раньше здесь стояло жёсткое false с комментарием «true на https», то есть
// про него надо было вспомнить руками при деплое — и, скорее всего, забыть.
// Теперь определяем по запросу: за обратным прокси (Supabase, Cloudflare,
// nginx) сам PHP видит http, поэтому смотрим и на X-Forwarded-Proto.
if ($cfg['auth']['cookie_secure'] === null) {
  $https =
    (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
    || (int)($_SERVER['SERVER_PORT'] ?? 0) === 443
    || strtolower((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';

  $envOverride = getenv('COOKIE_SECURE');
  $cfg['auth']['cookie_secure'] = $envOverride !== false
    ? filter_var($envOverride, FILTER_VALIDATE_BOOLEAN)
    : $https;
}

// 4) COOKIE_SAMESITE env override.
// On Render the frontend and backend live on different subdomains, so cookies
// need SameSite=None; Secure. Set COOKIE_SAMESITE=None in the backend service.
if (($envSameSite = getenv('COOKIE_SAMESITE')) !== false) {
  $cfg['auth']['cookie_samesite'] = $envSameSite;
}

// 5) validate DB (строго обязательно)
if (!$cfg['db']['dsn'] || !$cfg['db']['user'] || !$cfg['db']['pass']) {
  throw new RuntimeException(
    'Database config is not set. Provide in config.local.php or env vars: DB_DSN, DB_USER, DB_PASS'
  );
}

return $cfg;
