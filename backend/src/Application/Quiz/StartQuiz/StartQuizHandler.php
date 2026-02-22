<?php
declare(strict_types=1);
namespace App\Application\Quiz\StartQuiz;
use App\Domain\Quiz\QuizSession;use App\Domain\Quiz\QuizSessionRepository;
final class StartQuizHandler { public function __construct(private QuizSessionRepository $sessions) {} public function handle(StartQuizCommand $c): StartQuizResult { $code=$this->sessions->generateAccessCode(); $guard=0; while($this->sessions->isCodeTaken($code)){ $code=$this->sessions->generateAccessCode(); if(++$guard>20) throw new \RuntimeException('Could not generate unique code'); } $expiresAt=new \DateTimeImmutable('+' . $c->ttlSeconds . ' seconds', new \DateTimeZone('UTC')); $s=QuizSession::start($this->sessions->nextId(),$c->userId,$code,$expiresAt,$c->topic,$c->questionsJson); $this->sessions->save($s); return new StartQuizResult($s->id()->value(),$s->accessCode(),$s->expiresAt()->format(DATE_ATOM)); }}
