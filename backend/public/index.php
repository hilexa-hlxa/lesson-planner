<?php
declare(strict_types=1);

// 1. Initial Setup
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';

$config = require __DIR__ . '/../config.php';

require __DIR__ . '/../src/DB.php';
require __DIR__ . '/../src/AuthService.php';
require __DIR__ . '/../src/Response.php';

$db   = new DB($config['db']);
$auth = new AuthService($db->pdo(), $config['auth']);

// ---------------- CORS Configuration ----------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8000',
];

if (in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header("Vary: Origin");
  header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 600");

// Handle preflight requests
if ($method === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// ---------------- Helper Functions ----------------
function readJsonBodyOrFail(): array {
  $raw = file_get_contents('php://input') ?: '';
  if ($raw === '') return [];

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

// ---------------- SSE Stream Route ----------------
if ($method === 'POST' && preg_match('#^/api/generate/stream/?$#', $path)) {
  require __DIR__ . '/../src/GenerateStream.php';
  \App\GenerateStream::handle($config, $body); 
  exit;
}

try {
  error_log("Request: {$method} {$path}");

  // ======================================================
  // Quiz Management Routes
  // ======================================================

  // 1. Start Session
  if ($method === 'POST' && $path === '/api/quiz/start') {
      $u = $auth->currentUser();
      if (!$u) Response::error('Unauthorized', 401);

      $id = (int)($body['id'] ?? 0);
      if (!$id) Response::error('ID required', 400);

      $code = '';
      $attempts = 0;

      // ЦИКЛ ГЕНЕРАЦИИ (ЗАЩИТА ОТ ДУБЛЕЙ)
      do {
          $code = (string)rand(1000, 9999);
          
          $stmt = $db->pdo()->prepare("
              SELECT 1 FROM generations 
              WHERE access_code = :code 
              AND code_expires_at > NOW()
          ");
          $stmt->execute([':code' => $code]);
          $isTaken = (bool)$stmt->fetchColumn();
          
          $attempts++;
          if ($attempts > 10) Response::error('Server busy, try again', 503);

      } while ($isTaken);

      $stmt = $db->pdo()->prepare("
          UPDATE generations 
          SET access_code = :code, 
              code_expires_at = NOW() + INTERVAL '4 hours' 
          WHERE id = :id AND user_id = :uid
      ");
      $stmt->execute([':code' => $code, ':id' => $id, ':uid' => $u['id']]);

      Response::ok(['code' => $code]);
  }

  // 2. Join Session
  if ($method === 'POST' && $path === '/api/quiz/join') {
      $code = (string)($body['code'] ?? '');
      if (strlen($code) !== 4) Response::error('Invalid format', 400);

      $stmt = $db->pdo()->prepare("
          SELECT id, subject, topic, result_md, code_expires_at 
          FROM generations 
          WHERE access_code = :code 
          LIMIT 1
      ");
      $stmt->execute([':code' => $code]);
      $quiz = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$quiz) Response::error('Quiz not found', 404);

      if (strtotime($quiz['code_expires_at']) < time()) {
          Response::error('Session expired', 410);
      }

      Response::ok(['quiz' => $quiz]);
  }

  // 3. Submit Results
  if ($method === 'POST' && $path === '/api/quiz/submit') {
      $quizId   = (int)($body['quiz_id'] ?? 0);
      $name     = trim((string)($body['student_name'] ?? 'Guest'));
      $score    = (int)($body['score'] ?? 0);
      $total    = (int)($body['total'] ?? 0);
      $duration = (int)($body['duration'] ?? 0);
      $details  = json_encode($body['details'] ?? []);

      if (!$quizId || !$total) Response::error('Invalid data', 400);

      $percentage = (int)round(($score / $total) * 100);

      $stmt = $db->pdo()->prepare("
          INSERT INTO quiz_results 
            (quiz_id, student_name, score, total_questions, percentage, duration_seconds, answers_json)
          VALUES 
            (:qid, :name, :score, :total, :perc, :dur, :details)
      ");
      $stmt->execute([
          ':qid'   => $quizId, 
          ':name'  => $name,
          ':score' => $score, 
          ':total' => $total, 
          ':perc'  => $percentage,
          ':dur'   => $duration,
          ':details' => $details
      ]);

      Response::ok(['success' => true]);
  }

  // 4. Get Report
  if ($method === 'GET' && preg_match('#^/api/quiz/(\d+)/report$#', $path, $m)) {
      $u = $auth->currentUser();
      if (!$u) Response::error('Unauthorized', 401);

      $quizId = (int)$m[1];

      // Verify ownership
      $stmt = $db->pdo()->prepare("
          SELECT id FROM generations 
          WHERE id = :id AND user_id = :uid
      ");
      $stmt->execute([':id' => $quizId, ':uid' => $u['id']]);
      
      if (!$stmt->fetch()) Response::error('Access denied', 403);

      $stmt = $db->pdo()->prepare("
          SELECT 
            student_name, score, total_questions, percentage, duration_seconds, created_at, answers_json 
          FROM quiz_results 
          WHERE quiz_id = :qid 
          ORDER BY score DESC, duration_seconds ASC
      ");
      $stmt->execute([':qid' => $quizId]);
      
      Response::ok(['results' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
  }

  // 5. EXPORT TO CSV (Скачать отчет)
  if ($method === 'GET' && preg_match('#^/api/quiz/(\d+)/export$#', $path, $m)) {
      $u = $auth->currentUser();
      if (!$u) Response::error('Unauthorized', 401);

      $quizId = (int)$m[1];

      // Проверка прав
      $stmt = $db->pdo()->prepare("SELECT topic FROM generations WHERE id = :id AND user_id = :uid");
      $stmt->execute([':id' => $quizId, ':uid' => $u['id']]);
      $quiz = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$quiz) Response::error('Access denied', 403);

      // Данные
      $stmt = $db->pdo()->prepare("
          SELECT student_name, score, total_questions, percentage, duration_seconds, created_at 
          FROM quiz_results 
          WHERE quiz_id = :qid 
          ORDER BY score DESC
      ");
      $stmt->execute([':qid' => $quizId]);
      $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

      // Заголовки для скачивания
      header('Content-Type: text/csv; charset=utf-8');
      header('Content-Disposition: attachment; filename="report_' . $quizId . '.csv"');

      $output = fopen('php://output', 'w');
      fputs($output, "\xEF\xBB\xBF"); // BOM для Excel
      fputcsv($output, ['Имя', 'Баллы', 'Всего', 'Процент', 'Время (сек)', 'Дата']);

      foreach ($rows as $row) {
          fputcsv($output, $row);
      }
      fclose($output);
      exit;
  }

  // ======================================================
  // Authentication Routes
  // ======================================================

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

  // ======================================================
  // Economy & Coins Routes
  // ======================================================

  if ($method === 'GET' && $path === '/api/coins') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    
    $stmt = $db->pdo()->prepare("SELECT coins FROM users WHERE id = :id");
    $stmt->execute([':id' => $u['id']]);
    $res = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $coins = $res ? (int)$res['coins'] : 120;
    Response::ok(['coins' => $coins]);
  }

  if ($method === 'POST' && $path === '/api/coins/add') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    
    $amount = (int)($body['amount'] ?? 0);
    if ($amount <= 0) Response::error('Invalid amount', 400);
    
    $stmt = $db->pdo()->prepare("UPDATE users SET coins = coins + :amount WHERE id = :id");
    $stmt->execute([':amount' => $amount, ':id' => $u['id']]);
    
    $stmt = $db->pdo()->prepare("SELECT coins FROM users WHERE id = :id");
    $stmt->execute([':id' => $u['id']]);
    
    Response::ok(['coins' => $stmt->fetchColumn()]);
  }

  // ======================================================
  // Content Generation Routes
  // ======================================================

  if ($method === 'GET' && $path === '/api/generations') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $limit = (int)($_GET['limit'] ?? 50);
    if ($limit <= 0) $limit = 50;
    if ($limit > 100) $limit = 100;

    $stmt = $db->pdo()->prepare("
      SELECT id, topic, subject, status, created_at, access_code, result_md
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

  if ($method === 'POST' && $path === '/api/generations') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $subject  = (string)($body['subject'] ?? '');
    $topic    = (string)($body['topic'] ?? '');
    $details  = isset($body['details']) ? (string)$body['details'] : null;
    
    // --- FIX: Приводим к INT, чтобы база не падала от "90 Мин" ---
    $grade    = isset($body['grade']) ? (int)$body['grade'] : 0;
    $duration = isset($body['duration']) ? (int)$body['duration'] : 0;
    
    $lang     = (string)($body['lang'] ?? 'RU');
    $prompt   = (string)($body['prompt'] ?? '');

    if ($subject === '' || $topic === '') Response::error('Subject/Topic required', 400);
    if ($prompt === '') Response::error('Prompt required', 400);

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

  if ($method === 'PATCH' && preg_match('#^/api/generations/(\d+)$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $id = (int)$m[1];

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

  if ($method === 'DELETE' && preg_match('#^/api/generations/(\d+)$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $id = (int)$m[1];

    $stmt = $db->pdo()->prepare("DELETE FROM generations WHERE id = :id AND user_id = :uid");
    $stmt->execute([':id' => $id, ':uid' => $u['id']]);

    Response::ok(['ok' => true]);
  }

  // ======================================================
  // Achievements System
  // ======================================================

  if ($method === 'POST' && $path === '/api/achievements/grant') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $key = (string)($body['key'] ?? '');
    if ($key === '') Response::error('Achievement key required', 400);

    $rewards = ['visit_profile' => 100];
    if (!isset($rewards[$key])) Response::error('Unknown achievement', 404);

    try {
        $db->pdo()->beginTransaction();
        
        $stmt = $db->pdo()->prepare("
            INSERT INTO user_achievements (user_id, achievement_key)
            VALUES (:uid, :key)
            ON CONFLICT (user_id, achievement_key) DO NOTHING
            RETURNING id
        ");
        $stmt->execute([':uid' => $u['id'], ':key' => $key]);
        
        $newId = $stmt->fetchColumn();

        if (!$newId) {
            $db->pdo()->rollBack();
            Response::ok(['new' => false]);
        }

        $stmt = $db->pdo()->prepare("UPDATE users SET coins = coins + :amt WHERE id = :uid");
        $stmt->execute([':amt' => $rewards[$key], ':uid' => $u['id']]);

        $db->pdo()->commit();

        $stmt = $db->pdo()->prepare("SELECT coins FROM users WHERE id = :uid");
        $stmt->execute([':uid' => $u['id']]);
        
        Response::ok(['new' => true, 'reward' => $rewards[$key], 'coins' => $stmt->fetchColumn()]);
    } catch (Throwable $e) {
        if ($db->pdo()->inTransaction()) $db->pdo()->rollBack();
        throw $e;
    }
  }

  // Fallback for undefined routes
  error_log("404 Not Found: {$path}");
  Response::error('Endpoint not found', 404);

} catch (Throwable $e) {
  error_log("Critical Server Error: " . $e->getMessage());
  Response::error('Internal Server Error', 500);
}