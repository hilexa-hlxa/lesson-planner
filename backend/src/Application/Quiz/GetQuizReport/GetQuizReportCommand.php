<?php
declare(strict_types=1);
namespace App\Application\Quiz\GetQuizReport;
final class GetQuizReportCommand { public function __construct(public string $quizId) {} }
