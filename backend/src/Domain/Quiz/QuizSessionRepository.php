<?php
declare(strict_types=1);
namespace App\Domain\Quiz;
interface QuizSessionRepository { public function nextId(): QuizSessionId; public function generateAccessCode(): string; public function isCodeTaken(string $code): bool; public function save(QuizSession $session): void; public function byCode(string $code): ?QuizSession; public function byId(QuizSessionId $id): ?QuizSession; }
