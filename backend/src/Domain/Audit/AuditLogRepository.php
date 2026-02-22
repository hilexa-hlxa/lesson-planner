<?php
declare(strict_types=1);
namespace App\Domain\Audit;
interface AuditLogRepository { public function save(AuditLog $auditLog): void; }
