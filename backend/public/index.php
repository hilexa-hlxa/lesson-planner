<?php

declare(strict_types=1);

use App\Bootstrap\Container;

require __DIR__ . '/../vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$config = require __DIR__ . '/../config.php';
$container = new Container($config);

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
    ['POST', '#^/api/auth/register$#', $container->registerUserController()],
    ['POST', '#^/api/auth/login$#', $container->loginUserController()],
    ['POST', '#^/api/posts$#', $container->createPostController()],
    ['POST', '#^/api/comments$#', $container->addCommentController()],
    ['POST', '#^/api/groups$#', $container->createGroupController()],

    ['POST', '#^/api/generations$#', $container->createGenerationController()],
    ['GET', '#^/api/generations$#', $container->listGenerationsController()],
    ['GET', '#^/api/generations/([^/]+)$#', $container->getGenerationController()],
    ['PATCH', '#^/api/generations/([^/]+)$#', $container->updateGenerationController()],
    ['DELETE', '#^/api/generations/([^/]+)$#', $container->deleteGenerationController()],
    ['GET', '#^/api/generations/([^/]+)/export-docx$#', $container->exportGenerationDocxController()],

    ['POST', '#^/api/generate/stream$#', $container->generateLessonStreamController()],

    ['POST', '#^/api/quiz/start$#', $container->startQuizController()],
    ['POST', '#^/api/quiz/join$#', $container->joinQuizController()],
    ['POST', '#^/api/quiz/submit$#', $container->submitQuizController()],
    ['GET', '#^/api/quiz/([^/]+)/report$#', $container->getQuizReportController()],
    ['GET', '#^/api/quiz/([^/]+)/export$#', $container->exportQuizReportController()],

    ['GET', '#^/api/coins$#', $container->getCoinsController()],
    ['POST', '#^/api/coins/add$#', $container->addCoinsController()],
    ['POST', '#^/api/achievements/grant$#', $container->grantAchievementController()],
    ['GET', '#^/api/me$#', $container->currentUserController()],
];

foreach ($routes as [$routeMethod, $pattern, $controller]) {
    if ($routeMethod !== $method) { continue; }
    if (preg_match($pattern, rtrim($path, '/') === '' ? '/' : rtrim($path, '/'), $matches) === 1) {
        array_shift($matches);
        $controller(...$matches);
        exit;
    }
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Not found'], JSON_THROW_ON_ERROR);
