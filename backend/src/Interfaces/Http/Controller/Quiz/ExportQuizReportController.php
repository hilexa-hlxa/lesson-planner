<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Quiz;
use App\Application\Quiz\ExportQuizReport\ExportQuizReportCommand;use App\Application\Quiz\ExportQuizReport\ExportQuizReportHandler;use App\Interfaces\Http\Support\ErrorMapper;
final class ExportQuizReportController { public function __construct(private ExportQuizReportHandler $handler) {} public function __invoke(string $id): void { try{$csv=$this->handler->handle(new ExportQuizReportCommand($id)); header('Content-Type: text/csv'); header('Content-Disposition: attachment; filename="quiz-'.$id.'-report.csv"'); echo $csv; }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e); http_response_code($s); header('Content-Type: application/json'); echo json_encode(['error'=>$m], JSON_THROW_ON_ERROR);} }}
