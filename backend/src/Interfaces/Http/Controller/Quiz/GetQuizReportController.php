<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Quiz;
use App\Application\Quiz\GetQuizReport\GetQuizReportCommand;use App\Application\Quiz\GetQuizReport\GetQuizReportHandler;use App\Interfaces\Http\Controller\JsonController;use App\Interfaces\Http\Support\ErrorMapper;
final class GetQuizReportController extends JsonController { public function __construct(private GetQuizReportHandler $handler) {} public function __invoke(string $id): void { try{$r=$this->handler->handle(new GetQuizReportCommand($id)); $this->json(200,['rows'=>$r->rows]); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e);$this->json($s,['error'=>$m]);} }}
