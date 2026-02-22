<?php
declare(strict_types=1);
namespace App\Application\Quiz\GetQuizReport;
use App\Domain\Quiz\QuizResultRepository;use App\Domain\Quiz\QuizSessionId;
final class GetQuizReportHandler { public function __construct(private QuizResultRepository $results) {} public function handle(GetQuizReportCommand $c): GetQuizReportResult { $rows=[]; foreach($this->results->listByQuiz(QuizSessionId::fromString($c->quizId)) as $r){$rows[]=['studentName'=>$r->studentName(),'student_name'=>$r->studentName(),'score'=>$r->score(),'total'=>$r->total(),'total_questions'=>$r->total(),'percentage'=>$r->percentage(),'duration'=>$r->duration(),'duration_seconds'=>$r->duration(),'answersJson'=>$r->answersJson(),'answers_json'=>$r->answersJson(),'createdAt'=>$r->createdAt()->format(DATE_ATOM),'created_at'=>$r->createdAt()->format(DATE_ATOM)];} return new GetQuizReportResult($rows); }}
