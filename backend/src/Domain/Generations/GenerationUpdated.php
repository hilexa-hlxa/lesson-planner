<?php
declare(strict_types=1);
namespace App\Domain\Generations;
use App\Domain\DomainEvent;
final class GenerationUpdated implements DomainEvent { public function __construct(private GenerationId $generationId, private \DateTimeImmutable $occurredOn) {} public function generationId(): GenerationId { return $this->generationId; } public function occurredOn(): \DateTimeImmutable { return $this->occurredOn; } }
