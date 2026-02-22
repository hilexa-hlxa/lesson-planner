<?php
declare(strict_types=1);
namespace App\Domain\Generations;
interface GenerationRepository { public function nextId(): GenerationId; public function save(Generation $generation): void; /** @return Generation[] */ public function listByUser(string $userId): array; public function byId(GenerationId $id): ?Generation; public function delete(GenerationId $id): void; }
