<?php
declare(strict_types=1);
namespace App\Application\Quiz\JoinQuiz;
final class JoinQuizResult { public function __construct(public string $quizId, public string $topic, public ?string $questionsJson) {} }
