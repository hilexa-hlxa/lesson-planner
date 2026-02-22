<?php
declare(strict_types=1);
namespace App\Domain\Quiz;
use App\Domain\DomainEvent;
final class QuizSession { /** @var DomainEvent[] */ private array $events=[]; private function __construct(private QuizSessionId $id, private string $userId, private string $accessCode, private \DateTimeImmutable $expiresAt, private string $status, private string $topic, private ?string $questionsJson) {}
public static function start(QuizSessionId $id,string $userId,string $accessCode,\DateTimeImmutable $expiresAt,string $topic,?string $questionsJson): self { $s=new self($id,$userId,$accessCode,$expiresAt,'started',$topic,$questionsJson); $s->events[]=new QuizStarted($id,new \DateTimeImmutable('now', new \DateTimeZone('UTC'))); return $s; }
public static function reconstitute(QuizSessionId $id,string $userId,string $accessCode,\DateTimeImmutable $expiresAt,string $status,string $topic,?string $questionsJson): self { return new self($id,$userId,$accessCode,$expiresAt,$status,$topic,$questionsJson); }
public function markSubmitted(): void { $this->status='submitted'; $this->events[]=new QuizSubmitted($this->id,new \DateTimeImmutable('now', new \DateTimeZone('UTC'))); }
public function isExpired(\DateTimeImmutable $now): bool { return $this->expiresAt < $now; }
public function id(): QuizSessionId { return $this->id; } public function userId(): string { return $this->userId; } public function accessCode(): string { return $this->accessCode; } public function expiresAt(): \DateTimeImmutable { return $this->expiresAt; } public function status(): string { return $this->status; } public function topic(): string { return $this->topic; } public function questionsJson(): ?string { return $this->questionsJson; }
/** @return DomainEvent[] */ public function releaseDomainEvents(): array { $e=$this->events; $this->events=[]; return $e; }}
