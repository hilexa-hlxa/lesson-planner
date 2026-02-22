<?php
declare(strict_types=1);
namespace App\Application\Quiz\ExportQuizReport;
final class ExportQuizReportCommand { public function __construct(public string $quizId) {} }
