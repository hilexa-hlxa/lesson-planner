<?php
declare(strict_types=1);
namespace App\Application\Quiz\JoinQuiz;
use App\Domain\Quiz\QuizSessionRepository;
final class JoinQuizHandler { public function __construct(private QuizSessionRepository $sessions) {} public function handle(JoinQuizCommand $c): JoinQuizResult { $s=$this->sessions->byCode($c->accessCode); if($s===null) throw new \DomainException('Quiz not found'); if($s->isExpired(new \DateTimeImmutable('now', new \DateTimeZone('UTC')))) throw new \DomainException('Quiz expired'); return new JoinQuizResult($s->id()->value(),$s->topic(),$s->questionsJson()); }}
