<?php
declare(strict_types=1);
namespace App\Application\Generations\CreateGeneration;
use App\Application\Shared\TransactionManager;use App\Domain\Audit\AuditLog;use App\Domain\Audit\AuditLogRepository;use App\Domain\Generations\Generation;use App\Domain\Generations\GenerationRepository;
final class CreateGenerationHandler { public function __construct(private GenerationRepository $generations, private TransactionManager $tx, private AuditLogRepository $audit) {} public function handle(CreateGenerationCommand $c): CreateGenerationResult { return $this->tx->transactional(function () use ($c): CreateGenerationResult { $g=Generation::create($this->generations->nextId(),$c->userId,$c->type,$c->subject,$c->topic,$c->details,$c->grade,$c->duration,$c->lang,$c->prompt); $this->generations->save($g); foreach($g->releaseDomainEvents() as $e){$this->audit->save(AuditLog::fromDomainEvent($e));} return new CreateGenerationResult($g->id()->value());}); }}
