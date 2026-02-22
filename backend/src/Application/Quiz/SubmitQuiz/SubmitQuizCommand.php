<?php
declare(strict_types=1);
namespace App\Application\Quiz\SubmitQuiz;
final class SubmitQuizCommand { public function __construct(public string $quizId, public string $studentName, public int $score, public int $total, public int $duration, public string $answersJson) {} }
