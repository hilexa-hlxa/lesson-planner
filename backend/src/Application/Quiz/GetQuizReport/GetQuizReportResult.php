<?php
declare(strict_types=1);
namespace App\Application\Quiz\GetQuizReport;
final class GetQuizReportResult { /** @param array<int,array<string,mixed>> $rows */ public function __construct(public array $rows) {} }
