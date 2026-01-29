<?php
declare(strict_types=1);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';

$config = require __DIR__ . '/../config.php';

require __DIR__ . '/../src/DB.php';
require __DIR__ . '/../src/AuthService.php';
require __DIR__ . '/../src/Response.php';

$db   = new DB($config['db']);
$auth = new AuthService($db->pdo(), $config['auth']);

// ---------------- CORS ----------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

if (in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header("Vary: Origin");
  header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 600");

if ($method === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// ------------- helpers -------------
function readJsonBodyOrFail(): array {
  $raw = file_get_contents('php://input') ?: '';
  if ($raw === '') return [];

  // optional: защитимся от слишком больших тел
  if (strlen($raw) > 1024 * 1024) {
    Response::error('Payload too large', 413);
  }

  $data = json_decode($raw, true);
  if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    Response::error('Invalid JSON', 400);
  }
  return is_array($data) ? $data : [];
}

$body = in_array($method, ['POST','PUT','PATCH'], true) ? readJsonBodyOrFail() : [];

try {
  // ---- routes ----
  if ($method === 'POST' && $path === '/api/auth/register') {
    try {
      $userId = $auth->register(
        (string)($body['email'] ?? ''),
        (string)($body['password'] ?? ''),
        isset($body['displayName']) ? (string)$body['displayName'] : null
      );
      Response::ok(['userId' => $userId]);
    } catch (\DomainException $e) {
      Response::error($e->getMessage(), 400);
    } catch (\RuntimeException $e) {
      // email exists и прочие прикладные ошибки
      $msg = $e->getMessage();
      $status = (stripos($msg, 'exists') !== false) ? 409 : 400;
      Response::error($msg, $status);
    }
  }

  if ($method === 'POST' && $path === '/api/auth/login') {
    $ok = $auth->login((string)($body['email'] ?? ''), (string)($body['password'] ?? ''));
    if (!$ok) Response::error('Wrong email or password', 401);
    Response::ok();
  }

  if ($method === 'POST' && $path === '/api/auth/logout') {
    $auth->logout();
    Response::ok();
  }

  if ($method === 'GET' && $path === '/api/me') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    Response::ok(['user' => $u]);
  }

  if ($method === 'GET' && $path === '/api/generations') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $limit = (int)($_GET['limit'] ?? 50);
    if ($limit <= 0) $limit = 50;
    if ($limit > 100) $limit = 100;

    $stmt = $db->pdo()->prepare("
      SELECT id, topic, status, created_at
      FROM generations
      WHERE user_id = :uid
      ORDER BY created_at DESC
      LIMIT :limit
    ");
    $stmt->bindValue(':uid', $u['id']);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();

    Response::ok(['items' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
  }

  // POST /api/generations
  if ($method === 'POST' && $path === '/api/generations') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    // простая валидация
    $subject  = (string)($body['subject'] ?? '');
    $topic    = (string)($body['topic'] ?? '');
    $details  = isset($body['details']) ? (string)$body['details'] : null;
    $grade    = isset($body['grade']) ? (string)$body['grade'] : null;
    $duration = isset($body['duration']) ? (string)$body['duration'] : null;
    $lang     = (string)($body['lang'] ?? 'RU');
    $prompt   = (string)($body['prompt'] ?? '');

    if ($subject === '' || $topic === '') Response::error('subject/topic required', 400);
    if ($prompt === '') Response::error('prompt required', 400);

    $stmt = $db->pdo()->prepare("
      INSERT INTO generations
        (user_id, subject, topic, details, grade, duration, lang, prompt, status)
      VALUES
        (:uid, :subject, :topic, :details, :grade, :duration, :lang, :prompt, 'pending')
      RETURNING id
    ");
    $stmt->execute([
      ':uid'      => $u['id'],
      ':subject'  => $subject,
      ':topic'    => $topic,
      ':details'  => $details,
      ':grade'    => $grade,
      ':duration' => $duration,
      ':lang'     => $lang,
      ':prompt'   => $prompt,
    ]);

    $id = $stmt->fetchColumn();
    Response::ok(['id' => $id], 201);
  }

  // GET /api/generations/{id}
  if ($method === 'GET' && preg_match('#^/api/generations/(\d+)$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $id = (int)$m[1];

    $stmt = $db->pdo()->prepare("
      SELECT *
      FROM generations
      WHERE id = :id AND user_id = :uid
      LIMIT 1
    ");
    $stmt->execute([':id' => $id, ':uid' => $u['id']]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) Response::error('Not found', 404);
    Response::ok(['item' => $row]);
  }

  // PATCH /api/generations/{id}
  if ($method === 'PATCH' && preg_match('#^/api/generations/(\d+)$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $id = (int)$m[1];

    // разрешаем обновлять только эти поля
    $allowed = ['status', 'result_md', 'error'];
    $set = [];
    $params = [':id' => $id, ':uid' => $u['id']];

    foreach ($allowed as $f) {
      if (array_key_exists($f, $body)) {
        $set[] = "$f = :$f";
        $params[":$f"] = $body[$f];
      }
    }

    if (!$set) Response::error('Nothing to update', 400);

    $sql = "UPDATE generations SET " . implode(', ', $set) . " WHERE id = :id AND user_id = :uid";
    $stmt = $db->pdo()->prepare($sql);
    $stmt->execute($params);

    Response::ok(['ok' => true]);
  }

  // DELETE /api/generations/{id}
  if ($method === 'DELETE' && preg_match('#^/api/generations/(\d+)$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $id = (int)$m[1];

    $stmt = $db->pdo()->prepare("DELETE FROM generations WHERE id = :id AND user_id = :uid");
    $stmt->execute([':id' => $id, ':uid' => $u['id']]);

    Response::ok(['ok' => true]);
  }

  Response::error('Not found', 404);

} catch (Throwable $e) {
  // детали только в лог
  error_log("SERVER ERROR: " . $e->getMessage());
  Response::error('Server error', 500);
}
