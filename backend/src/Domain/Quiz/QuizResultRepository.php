<?php
declare(strict_types=1);
namespace App\Domain\Quiz;
interface QuizResultRepository { public function nextId(): QuizResultId; public function save(QuizResult $result): void; /** @return QuizResult[] */ public function listByQuiz(QuizSessionId $quizId): array; }
