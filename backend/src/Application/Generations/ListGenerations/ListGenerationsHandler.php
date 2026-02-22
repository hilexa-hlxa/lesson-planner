<?php
declare(strict_types=1);
namespace App\Application\Generations\ListGenerations;
use App\Domain\Generations\GenerationRepository;
final class ListGenerationsHandler { public function __construct(private GenerationRepository $generations) {} public function handle(ListGenerationsCommand $c): ListGenerationsResult { $items=[]; foreach($this->generations->listByUser($c->userId) as $g){$items[]=['id'=>$g->id()->value(),'subject'=>$g->subject(),'topic'=>$g->topic(),'status'=>$g->status(),'updatedAt'=>$g->updatedAt()->format(DATE_ATOM)];} return new ListGenerationsResult($items); }}
