<?php
declare(strict_types=1);
namespace App\Application\Quiz\ExportQuizReport;
use App\Domain\Quiz\QuizResultRepository;use App\Domain\Quiz\QuizSessionId;
final class ExportQuizReportHandler { public function __construct(private QuizResultRepository $results) {} public function handle(ExportQuizReportCommand $c): string { $lines=[['studentName','score','total','percentage','duration','createdAt']]; foreach($this->results->listByQuiz(QuizSessionId::fromString($c->quizId)) as $r){$lines[]=[ $r->studentName(),(string)$r->score(),(string)$r->total(),(string)$r->percentage(),(string)$r->duration(),$r->createdAt()->format(DATE_ATOM)]; } $fh=fopen('php://temp','rb+'); if($fh===false) throw new \RuntimeException('Cannot create CSV'); foreach($lines as $line){fputcsv($fh,$line);} rewind($fh); $csv=(string)stream_get_contents($fh); fclose($fh); return $csv; }}
