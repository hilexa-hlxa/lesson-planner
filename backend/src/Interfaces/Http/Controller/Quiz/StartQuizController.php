<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Quiz;
use App\Application\Quiz\StartQuiz\StartQuizCommand;use App\Application\Quiz\StartQuiz\StartQuizHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class StartQuizController extends JsonController { public function __construct(private StartQuizHandler $handler) {} public function __invoke(): void { try{$b=$this->requestJson(); foreach(['userId','topic'] as $f){ if(!isset($b[$f])){ $this->json(400,['error'=>$f.' is required']); return; }} $r=$this->handler->handle(new StartQuizCommand((string)$b['userId'],(string)$b['topic'],$b['questionsJson']??null,(int)($b['ttlSeconds']??1800))); $this->json(201,['quizId'=>$r->quizId,'accessCode'=>$r->accessCode,'expiresAt'=>$r->expiresAt,'topic'=>(string)$b['topic'],'questionsJson'=>$b['questionsJson']??null]); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);} }}
