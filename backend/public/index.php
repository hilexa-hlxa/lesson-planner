<?php

declare(strict_types=1);

use App\Bootstrap\Container;

require __DIR__ . '/../vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$config = require __DIR__ . '/../config.php';
$container = new Container($config);

$migrateFlag = __DIR__ . '/../.migrated';
if (!file_exists($migrateFlag)) {
    try {
        $container->migrate();
        file_put_contents($migrateFlag, date('c'));
    } catch (\Throwable $e) {
        error_log('Migration skipped: ' . $e->getMessage());
    }
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8000'];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Correlation-ID, X-User-Id');
header('Access-Control-Max-Age: 600');

if ($method === 'OPTIONS') { http_response_code(204); exit; }

$routes = [
    ['POST', '#^/api/auth/register$#', fn() => $container->registerUserController()],
    ['POST', '#^/api/auth/login$#', fn() => $container->loginUserController()],
    ['POST', '#^/api/posts$#', fn() => $container->createPostController()],
    ['POST', '#^/api/comments$#', fn() => $container->addCommentController()],
    ['POST', '#^/api/groups$#', fn() => $container->createGroupController()],

    ['POST', '#^/api/generations$#', fn() => $container->createGenerationController()],
    ['GET', '#^/api/generations$#', fn() => $container->listGenerationsController()],
    ['GET', '#^/api/generations/([^/]+)$#', fn() => $container->getGenerationController()],
    ['PATCH', '#^/api/generations/([^/]+)$#', fn() => $container->updateGenerationController()],
    ['DELETE', '#^/api/generations/([^/]+)$#', fn() => $container->deleteGenerationController()],
    ['GET', '#^/api/generations/([^/]+)/export-docx$#', fn() => $container->exportGenerationDocxController()],

    ['POST', '#^/api/generate/stream$#', fn() => $container->generateLessonStreamController()],

    ['POST', '#^/api/quiz/start$#', fn() => $container->startQuizController()],
    ['POST', '#^/api/quiz/join$#', fn() => $container->joinQuizController()],
    ['POST', '#^/api/quiz/submit$#', fn() => $container->submitQuizController()],
    ['GET', '#^/api/quiz/([^/]+)/report$#', fn() => $container->getQuizReportController()],
    ['GET', '#^/api/quiz/([^/]+)/export$#', fn() => $container->exportQuizReportController()],

    ['GET', '#^/api/coins$#', fn() => $container->getCoinsController()],
    ['POST', '#^/api/coins/add$#', fn() => $container->addCoinsController()],
    ['POST', '#^/api/achievements/grant$#', fn() => $container->grantAchievementController()],
    ['GET', '#^/api/me$#', fn() => $container->currentUserController()],
];

foreach ($routes as [$routeMethod, $pattern, $factory]) {
    if ($routeMethod !== $method) { continue; }
    if (preg_match($pattern, rtrim($path, '/') === '' ? '/' : rtrim($path, '/'), $matches) === 1) {
        array_shift($matches);
        $factory()(...$matches);
        exit;
    }
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Not found'], JSON_THROW_ON_ERROR);
