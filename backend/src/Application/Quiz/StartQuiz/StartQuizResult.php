<?php
declare(strict_types=1);
namespace App\Application\Quiz\StartQuiz;
final class StartQuizResult { public function __construct(public string $quizId, public string $accessCode, public string $expiresAt) {} }
