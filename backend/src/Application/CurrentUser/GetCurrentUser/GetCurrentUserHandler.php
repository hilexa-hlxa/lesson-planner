<?php
declare(strict_types=1);
namespace App\Application\CurrentUser\GetCurrentUser;
use App\Domain\Auth\User\Email;use App\Domain\Auth\User\UserRepository;
final class GetCurrentUserHandler { public function __construct(private UserRepository $users) {} public function handle(GetCurrentUserCommand $c): GetCurrentUserResult { $u=$this->users->byEmail(Email::fromString($c->userId)); if($u===null) throw new \DomainException('User not found'); return new GetCurrentUserResult($u->id()->value(),$u->email()->value(),'user'); }}
