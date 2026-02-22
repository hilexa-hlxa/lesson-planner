<?php
declare(strict_types=1);
namespace App\Interfaces\Http\Controller\Generations;
use App\Application\Generations\ExportGenerationDocx\ExportGenerationDocxCommand;use App\Application\Generations\ExportGenerationDocx\ExportGenerationDocxHandler;use App\Interfaces\Http\Support\ErrorMapper;
final class ExportGenerationDocxController { public function __construct(private ExportGenerationDocxHandler $handler) {} public function __invoke(string $id): void { try{$path=$this->handler->handle(new ExportGenerationDocxCommand($id)); header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document'); header('Content-Disposition: attachment; filename="generation-'.$id.'.docx"'); readfile($path); }catch(\Throwable $e){[$s,$m]=ErrorMapper::map($e); http_response_code($s); header('Content-Type: application/json'); echo json_encode(['error'=>$m], JSON_THROW_ON_ERROR);} }}
