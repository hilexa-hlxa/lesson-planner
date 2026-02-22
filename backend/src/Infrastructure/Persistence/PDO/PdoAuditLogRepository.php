<?php
declare(strict_types=1);
namespace App\Infrastructure\Persistence\PDO;
use App\Domain\Audit\AuditLog;use App\Domain\Audit\AuditLogRepository;use PDO;
final class PdoAuditLogRepository implements AuditLogRepository { public function __construct(private PDO $pdo) {} public function save(AuditLog $auditLog): void { $stmt=$this->pdo->prepare('INSERT INTO audit (id, event_name, payload, created_at) VALUES (:id,:event_name,:payload,:created_at)'); $stmt->execute(['id'=>$auditLog->id(),'event_name'=>$auditLog->eventName(),'payload'=>$auditLog->payload(),'created_at'=>$auditLog->createdAt()->format('Y-m-d H:i:s')]); }}
