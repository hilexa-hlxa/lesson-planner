<?php
declare(strict_types=1);
namespace App\Application\Quiz\SubmitQuiz;
use App\Domain\Quiz\QuizResult;use App\Domain\Quiz\QuizResultRepository;use App\Domain\Quiz\QuizSessionId;use App\Domain\Quiz\QuizSessionRepository;
final class SubmitQuizHandler { public function __construct(private QuizSessionRepository $sessions, private QuizResultRepository $results) {} public function handle(SubmitQuizCommand $c): void { $sid=QuizSessionId::fromString($c->quizId); $s=$this->sessions->byId($sid); if($s===null) throw new \DomainException('Quiz not found'); $result=QuizResult::create($this->results->nextId(),$sid,$c->studentName,$c->score,$c->total,$c->duration,$c->answersJson); $this->results->save($result); $s->markSubmitted(); $this->sessions->save($s); }}
