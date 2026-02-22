<?php
declare(strict_types=1);
namespace App\Application\Generations\GetGeneration;
use App\Domain\Generations\GenerationId;use App\Domain\Generations\GenerationRepository;
final class GetGenerationHandler { public function __construct(private GenerationRepository $generations) {} public function handle(GetGenerationCommand $c): GetGenerationResult { $g=$this->generations->byId(GenerationId::fromString($c->generationId)); if($g===null) throw new \DomainException('Generation not found'); return new GetGenerationResult(['id'=>$g->id()->value(),'userId'=>$g->userId(),'subject'=>$g->subject(),'topic'=>$g->topic(),'details'=>$g->details(),'grade'=>$g->grade(),'duration'=>$g->duration(),'lang'=>$g->lang(),'prompt'=>$g->prompt(),'status'=>$g->status(),'resultMd'=>$g->resultMd(),'resultJson'=>$g->resultJson(),'createdAt'=>$g->createdAt()->format(DATE_ATOM),'updatedAt'=>$g->updatedAt()->format(DATE_ATOM)]); }}
