<?php
declare(strict_types=1);
namespace App\Application\Generations\UpdateGeneration;
use App\Application\Shared\TransactionManager;use App\Domain\Audit\AuditLog;use App\Domain\Audit\AuditLogRepository;use App\Domain\Generations\GenerationId;use App\Domain\Generations\GenerationRepository;
final class UpdateGenerationHandler { public function __construct(private GenerationRepository $generations, private TransactionManager $tx, private AuditLogRepository $audit) {} public function handle(UpdateGenerationCommand $c): void { $this->tx->transactional(function() use ($c): void { $g=$this->generations->byId(GenerationId::fromString($c->generationId)); if($g===null) throw new \DomainException('Generation not found'); $g->update($c->status,$c->resultMd,$c->resultJson,$c->topic,$c->details); $this->generations->save($g); foreach($g->releaseDomainEvents() as $e){$this->audit->save(AuditLog::fromDomainEvent($e));} }); }}
