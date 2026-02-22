<?php
declare(strict_types=1);
namespace App\Application\Quiz\StartQuiz;
final class StartQuizCommand { public function __construct(public string $userId, public string $topic, public ?string $questionsJson, public int $ttlSeconds = 1800) {} }
