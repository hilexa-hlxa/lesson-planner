<?php
declare(strict_types=1);
namespace App\Domain\Quiz;
use App\Domain\DomainEvent;
final class QuizStarted implements DomainEvent { public function __construct(private QuizSessionId $quizId, private \DateTimeImmutable $occurredOn) {} public function occurredOn(): \DateTimeImmutable { return $this->occurredOn; } public function quizId(): QuizSessionId { return $this->quizId; }}
