<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller;
abstract class JsonController { protected function json(int $status, array $payload): void { $correlationId = $_SERVER['HTTP_X_CORRELATION_ID'] ?? bin2hex(random_bytes(8)); http_response_code($status); header('Content-Type: application/json'); header('X-Correlation-ID: '.$correlationId); $payload['correlationId'] = $correlationId; echo json_encode($payload, JSON_THROW_ON_ERROR); } protected function requestJson(): array { $raw = file_get_contents('php://input') ?: ''; return $raw === '' ? [] : json_decode($raw, true, 512, JSON_THROW_ON_ERROR); }}
