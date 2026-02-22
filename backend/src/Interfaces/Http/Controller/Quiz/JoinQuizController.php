<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Quiz;
use App\Application\Quiz\JoinQuiz\JoinQuizCommand;use App\Application\Quiz\JoinQuiz\JoinQuizHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class JoinQuizController extends JsonController { public function __construct(private JoinQuizHandler $handler) {} public function __invoke(): void { try{$b=$this->requestJson(); $accessCode=(string)($b['accessCode'] ?? $b['access_code'] ?? ''); if($accessCode===''){ $this->json(400,['error'=>'accessCode is required']); return; } $r=$this->handler->handle(new JoinQuizCommand($accessCode)); $this->json(200,['quizId'=>$r->quizId,'topic'=>$r->topic,'questionsJson'=>$r->questionsJson]); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);} }}
