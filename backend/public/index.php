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
// Обязательно требуем сессию: без этой проверки эндпоинт был открытым прокси
// к Gemini — любой мог слать произвольные промпты за счёт нашего API-ключа.
if ($method === 'POST' && preg_match('#^/api/generate/stream/?$#', $path)) {
  if (!$auth->currentUser()) {
    Response::error('Unauthorized', 401);
  }
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

      // Optionally link to a class
      $classId = isset($body['class_id']) ? (int)$body['class_id'] : 0;
      if ($classId > 0) {
          $chk = $db->pdo()->prepare("SELECT 1 FROM classes WHERE id = :cid AND teacher_id = :uid");
          $chk->execute([':cid' => $classId, ':uid' => $u['id']]);
          if ($chk->fetchColumn()) {
              $lnk = $db->pdo()->prepare("UPDATE generations SET class_id = :cid WHERE id = :id AND user_id = :uid");
              $lnk->execute([':cid' => $classId, ':id' => $id, ':uid' => $u['id']]);
          }
      }

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

      $submitter = $auth->currentUser();
      $studentId = ($submitter && $submitter['role'] === 'student') ? (int)$submitter['id'] : null;

      $stmt = $db->pdo()->prepare("
          INSERT INTO quiz_results
            (quiz_id, student_name, student_id, score, total_questions, percentage, duration_seconds, answers_json)
          VALUES
            (:qid, :name, :sid, :score, :total, :perc, :dur, :details)
      ");
      $stmt->execute([
          ':qid'     => $quizId,
          ':name'    => $name,
          ':sid'     => $studentId,
          ':score'   => $score,
          ':total'   => $total,
          ':perc'    => $percentage,
          ':dur'     => $duration,
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
        array_key_exists('first_name', $body) ? (string)$body['first_name'] : null,
        array_key_exists('last_name',  $body) ? (string)$body['last_name']  : null,
        (string)($body['role'] ?? 'teacher')
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

  // Обновление собственного профиля (имя и фамилия)
  if ($method === 'PATCH' && $path === '/api/me') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $first = trim((string)($body['first_name'] ?? ''));
    $last  = trim((string)($body['last_name']  ?? ''));

    if ($first === '') Response::error('First name is required', 400);
    if (mb_strlen($first) > 80 || mb_strlen($last) > 80) {
      Response::error('Name is too long', 400);
    }

    $display = trim($first . ' ' . $last);

    $st = $db->pdo()->prepare("
      update users
      set first_name = :f, last_name = :l, display_name = :d
      where id = :id
    ");
    $st->execute([':f' => $first, ':l' => $last, ':d' => $display, ':id' => $u['id']]);

    Response::ok(['user' => $auth->currentUser()]);
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
      SELECT id, topic, subject, status, created_at, access_code
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

    $allowed = ['status', 'result_md', 'result_json', 'result_json_version', 'template_key', 'error', 'topic'];
    $set = [];
    $params = [':id' => $id, ':uid' => $u['id']];

    foreach ($allowed as $f) {
      if (!array_key_exists($f, $body)) continue;

      // SPECIAL: jsonb
      if ($f === 'result_json') {
        $set[] = "result_json = :result_json::jsonb";

        $v = $body['result_json'];

        // если пришёл массив/объект — кодируем
        if (is_array($v) || is_object($v)) {
          $json = json_encode($v, JSON_UNESCAPED_UNICODE);
          if ($json === false) Response::error('Invalid JSON payload', 400);
          $params[':result_json'] = $json;
        } else {
          // если пришла строка — считаем что это JSON-текст
          $params[':result_json'] = (string)$v;
        }

        continue;
      }

      // optional: int fields
      if ($f === 'result_json_version') {
        $set[] = "result_json_version = :result_json_version";
        $params[':result_json_version'] = (int)$body['result_json_version'];
        continue;
      }

      // default
      $set[] = "$f = :$f";
      $params[":$f"] = $body[$f];
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

  if ($method === 'GET' && preg_match('#^/api/generations/(\d+)/export-docx$#', $path, $m)) {
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

    require __DIR__ . '/../vendor/autoload.php';
    require __DIR__ . '/../src/DocxExport.php';

    \App\DocxExport::exportKmj($row);
    exit;
  }

  // ======================================================
  // Class Roster Routes
  // ======================================================

  // Helper: generate unique 6-char alphanumeric code
  function generateClassCode(\PDO $pdo): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $attempts = 0;
    do {
      $code = '';
      for ($i = 0; $i < 6; $i++) $code .= $chars[random_int(0, strlen($chars) - 1)];
      $s = $pdo->prepare("SELECT 1 FROM classes WHERE join_code = :c");
      $s->execute([':c' => $code]);
      if ($attempts++ > 20) throw new \RuntimeException('Could not generate unique code');
    } while ($s->fetchColumn());
    return $code;
  }

  // POST /api/classes — create class (teacher)
  if ($method === 'POST' && $path === '/api/classes') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    if ($u['role'] !== 'teacher') Response::error('Teachers only', 403);

    $name = trim((string)($body['name'] ?? ''));
    if ($name === '') Response::error('Name required', 400);
    if (mb_strlen($name) > 100) Response::error('Name too long', 400);

    $code = generateClassCode($db->pdo());

    $stmt = $db->pdo()->prepare("
      INSERT INTO classes (teacher_id, name, join_code)
      VALUES (:uid, :name, :code)
      RETURNING id, name, join_code, created_at
    ");
    $stmt->execute([':uid' => $u['id'], ':name' => $name, ':code' => $code]);
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);

    Response::ok(['class' => $row]);
  }

  // GET /api/classes — list classes
  if ($method === 'GET' && $path === '/api/classes') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    if ($u['role'] === 'teacher') {
      $stmt = $db->pdo()->prepare("
        SELECT c.id, c.name, c.join_code, c.created_at,
               COUNT(CASE WHEN cm.status = 'approved' THEN 1 END) AS member_count,
               COUNT(CASE WHEN cm.status = 'pending'  THEN 1 END) AS pending_count
        FROM classes c
        LEFT JOIN class_members cm ON cm.class_id = c.id
        WHERE c.teacher_id = :uid
        GROUP BY c.id
        ORDER BY c.created_at DESC
      ");
      $stmt->execute([':uid' => $u['id']]);
    } else {
      $stmt = $db->pdo()->prepare("
        SELECT c.id, c.name, c.created_at, cm.status,
               u.display_name AS teacher_name
        FROM class_members cm
        JOIN classes c ON c.id = cm.class_id
        JOIN users u ON u.id = c.teacher_id
        WHERE cm.student_id = :uid
        ORDER BY cm.applied_at DESC
      ");
      $stmt->execute([':uid' => $u['id']]);
    }

    Response::ok(['items' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
  }

  // POST /api/classes/join — student applies to join
  if ($method === 'POST' && $path === '/api/classes/join') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $code = strtoupper(trim((string)($body['join_code'] ?? '')));
    if (strlen($code) !== 6) Response::error('Invalid code format', 400);

    $stmt = $db->pdo()->prepare("SELECT id, name FROM classes WHERE join_code = :code LIMIT 1");
    $stmt->execute([':code' => $code]);
    $class = $stmt->fetch(\PDO::FETCH_ASSOC);
    if (!$class) Response::error('Class not found', 404);

    // Check existing membership
    $chk = $db->pdo()->prepare("SELECT status FROM class_members WHERE class_id = :cid AND student_id = :sid");
    $chk->execute([':cid' => $class['id'], ':sid' => $u['id']]);
    $existing = $chk->fetchColumn();
    if ($existing === 'approved') Response::ok(['status' => 'already_member', 'class_name' => $class['name']]);
    if ($existing === 'pending')  Response::ok(['status' => 'already_applied', 'class_name' => $class['name']]);

    $ins = $db->pdo()->prepare("
      INSERT INTO class_members (class_id, student_id, status) VALUES (:cid, :sid, 'pending')
    ");
    $ins->execute([':cid' => $class['id'], ':sid' => $u['id']]);

    Response::ok(['status' => 'pending', 'class_name' => $class['name']]);
  }

  // GET /api/classes/:id/members
  if ($method === 'GET' && preg_match('#^/api/classes/(\d+)/members$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    $classId = (int)$m[1];

    $own = $db->pdo()->prepare("SELECT 1 FROM classes WHERE id = :cid AND teacher_id = :uid");
    $own->execute([':cid' => $classId, ':uid' => $u['id']]);
    if (!$own->fetchColumn()) Response::error('Access denied', 403);

    $status = $_GET['status'] ?? 'all';
    $sql = "
      SELECT cm.id, cm.student_id, cm.status, cm.applied_at, cm.approved_at,
             u.display_name, u.first_name, u.last_name, u.email, u.phone
      FROM class_members cm
      JOIN users u ON u.id = cm.student_id
      WHERE cm.class_id = :cid
    ";
    if (in_array($status, ['pending', 'approved'], true)) $sql .= " AND cm.status = :status";
    $sql .= " ORDER BY cm.applied_at ASC";

    $stmt = $db->pdo()->prepare($sql);
    $params = [':cid' => $classId];
    if (in_array($status, ['pending', 'approved'], true)) $params[':status'] = $status;
    $stmt->execute($params);

    Response::ok(['members' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
  }

  // POST /api/classes/:id/members/:studentId/approve
  if ($method === 'POST' && preg_match('#^/api/classes/(\d+)/members/(\d+)/approve$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    $classId = (int)$m[1]; $studentId = (int)$m[2];

    $own = $db->pdo()->prepare("SELECT 1 FROM classes WHERE id = :cid AND teacher_id = :uid");
    $own->execute([':cid' => $classId, ':uid' => $u['id']]);
    if (!$own->fetchColumn()) Response::error('Access denied', 403);

    $stmt = $db->pdo()->prepare("
      UPDATE class_members SET status = 'approved', approved_at = NOW()
      WHERE class_id = :cid AND student_id = :sid
    ");
    $stmt->execute([':cid' => $classId, ':sid' => $studentId]);

    Response::ok(['ok' => true]);
  }

  // POST /api/classes/:id/approve-all
  if ($method === 'POST' && preg_match('#^/api/classes/(\d+)/approve-all$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    $classId = (int)$m[1];

    $own = $db->pdo()->prepare("SELECT 1 FROM classes WHERE id = :cid AND teacher_id = :uid");
    $own->execute([':cid' => $classId, ':uid' => $u['id']]);
    if (!$own->fetchColumn()) Response::error('Access denied', 403);

    $stmt = $db->pdo()->prepare("
      UPDATE class_members SET status = 'approved', approved_at = NOW()
      WHERE class_id = :cid AND status = 'pending'
    ");
    $stmt->execute([':cid' => $classId]);

    Response::ok(['ok' => true, 'approved_count' => $stmt->rowCount()]);
  }

  // DELETE /api/classes/:id/members/:studentId — kick student
  if ($method === 'DELETE' && preg_match('#^/api/classes/(\d+)/members/(\d+)$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    $classId = (int)$m[1]; $studentId = (int)$m[2];

    $own = $db->pdo()->prepare("SELECT 1 FROM classes WHERE id = :cid AND teacher_id = :uid");
    $own->execute([':cid' => $classId, ':uid' => $u['id']]);
    if (!$own->fetchColumn()) Response::error('Access denied', 403);

    $stmt = $db->pdo()->prepare("DELETE FROM class_members WHERE class_id = :cid AND student_id = :sid");
    $stmt->execute([':cid' => $classId, ':sid' => $studentId]);

    Response::ok(['ok' => true]);
  }

  // GET /api/classes/:id/quizzes
  if ($method === 'GET' && preg_match('#^/api/classes/(\d+)/quizzes$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    $classId = (int)$m[1];

    $own = $db->pdo()->prepare("SELECT 1 FROM classes WHERE id = :cid AND teacher_id = :uid");
    $own->execute([':cid' => $classId, ':uid' => $u['id']]);
    if (!$own->fetchColumn()) Response::error('Access denied', 403);

    $stmt = $db->pdo()->prepare("
      SELECT g.id, g.topic, g.subject, g.created_at,
             COUNT(qr.id) AS result_count,
             COALESCE(AVG(qr.percentage), 0) AS avg_score
      FROM generations g
      LEFT JOIN quiz_results qr ON qr.quiz_id = g.id
      WHERE g.class_id = :cid AND g.user_id = :uid
      GROUP BY g.id
      ORDER BY g.created_at DESC
    ");
    $stmt->execute([':cid' => $classId, ':uid' => $u['id']]);

    Response::ok(['quizzes' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
  }

  // GET /api/classes/:id — get single class
  if ($method === 'GET' && preg_match('#^/api/classes/(\d+)$#', $path, $m)) {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    $classId = (int)$m[1];

    $stmt = $db->pdo()->prepare("
      SELECT c.id, c.name, c.join_code, c.created_at, c.teacher_id,
             u.display_name AS teacher_name
      FROM classes c JOIN users u ON u.id = c.teacher_id
      WHERE c.id = :cid
      LIMIT 1
    ");
    $stmt->execute([':cid' => $classId]);
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);
    if (!$row) Response::error('Not found', 404);

    // Access: teacher owns it, or student is approved member
    if ($u['role'] === 'teacher' && (int)$row['teacher_id'] !== $u['id']) Response::error('Access denied', 403);
    if ($u['role'] === 'student') {
      $chk = $db->pdo()->prepare("SELECT 1 FROM class_members WHERE class_id = :cid AND student_id = :sid AND status = 'approved'");
      $chk->execute([':cid' => $classId, ':sid' => $u['id']]);
      if (!$chk->fetchColumn()) Response::error('Access denied', 403);
    }

    Response::ok(['class' => $row]);
  }

  // ======================================================
  // Wordle Routes
  // ======================================================

  // GET /api/wordle/word?lang=RU — random word for solo mode
  if ($method === 'GET' && $path === '/api/wordle/word') {
    $lang = strtoupper(trim($_GET['lang'] ?? 'RU'));
    if (!in_array($lang, ['RU', 'KZ', 'EN'], true)) $lang = 'RU';

    $stmt = $db->pdo()->prepare("
      SELECT word FROM word_bank WHERE lang = :lang ORDER BY RANDOM() LIMIT 1
    ");
    $stmt->execute([':lang' => $lang]);
    $word = $stmt->fetchColumn();

    if (!$word) Response::error('No words available', 404);
    Response::ok(['word' => $word]);
  }

  // POST /api/wordle/session — teacher creates class wordle session
  if ($method === 'POST' && $path === '/api/wordle/session') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);
    if ($u['role'] !== 'teacher') Response::error('Teachers only', 403);

    $word = strtoupper(trim((string)($body['word'] ?? '')));
    $lang = strtoupper(trim((string)($body['lang'] ?? 'RU')));
    if (!in_array($lang, ['RU', 'KZ', 'EN'], true)) $lang = 'RU';
    if (mb_strlen($word) < 3) Response::error('Word too short (min 3 letters)', 400);

    $code = '';
    $attempts = 0;
    do {
      $code = (string)rand(1000, 9999);
      $s = $db->pdo()->prepare("SELECT 1 FROM wordle_sessions WHERE access_code = :c AND expires_at > NOW()");
      $s->execute([':c' => $code]);
      if ($attempts++ > 10) Response::error('Server busy, try again', 503);
    } while ($s->fetchColumn());

    // Clear old sessions by this teacher
    $db->pdo()->prepare("DELETE FROM wordle_sessions WHERE teacher_id = :uid")->execute([':uid' => $u['id']]);

    $stmt = $db->pdo()->prepare("
      INSERT INTO wordle_sessions (teacher_id, word, lang, access_code)
      VALUES (:uid, :word, :lang, :code)
      RETURNING access_code, expires_at
    ");
    $stmt->execute([':uid' => $u['id'], ':word' => $word, ':lang' => $lang, ':code' => $code]);
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);

    Response::ok(['code' => $row['access_code'], 'expires_at' => $row['expires_at']]);
  }

  // POST /api/wordle/join — student joins class wordle with code
  if ($method === 'POST' && $path === '/api/wordle/join') {
    $code = (string)($body['code'] ?? '');
    if (strlen($code) !== 4) Response::error('Invalid format', 400);

    $stmt = $db->pdo()->prepare("
      SELECT word, lang FROM wordle_sessions
      WHERE access_code = :code AND expires_at > NOW()
      LIMIT 1
    ");
    $stmt->execute([':code' => $code]);
    $session = $stmt->fetch(\PDO::FETCH_ASSOC);

    if (!$session) Response::error('Session not found or expired', 404);
    Response::ok(['word' => $session['word'], 'lang' => $session['lang']]);
  }

  // ======================================================
  // Student History Routes
  // ======================================================

  // GET /api/student/history?class_id=X
  if ($method === 'GET' && $path === '/api/student/history') {
    $u = $auth->currentUser();
    if (!$u) Response::error('Unauthorized', 401);

    $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : 0;

    $sql = "
      SELECT g.id AS quiz_id, g.topic, g.subject, g.result_md,
             qr.score, qr.total_questions, qr.percentage, qr.duration_seconds,
             qr.answers_json, qr.created_at
      FROM quiz_results qr
      JOIN generations g ON g.id = qr.quiz_id
      WHERE qr.student_id = :sid
    ";
    $params = [':sid' => $u['id']];

    if ($classId > 0) {
      $sql .= " AND g.class_id = :cid";
      $params[':cid'] = $classId;
    }

    $sql .= " ORDER BY qr.created_at DESC LIMIT 50";

    $stmt = $db->pdo()->prepare($sql);
    $stmt->execute($params);

    Response::ok(['history' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
  }

  error_log("404 Not Found: {$path}");
  Response::error('Endpoint not found', 404);

} catch (Throwable $e) {
  error_log("Critical Server Error: " . $e->getMessage());
  Response::error('Internal Server Error', 500);
}