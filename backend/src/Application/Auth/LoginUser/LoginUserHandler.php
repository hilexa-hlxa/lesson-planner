<?php
declare(strict_types=1);
namespace App\Application\Auth\LoginUser;
use App\Application\Auth\Security\PasswordHasher;use App\Application\Shared\TransactionManager;use App\Domain\Auth\User\Email;use App\Domain\Auth\User\InvalidCredentials;use App\Domain\Auth\User\UserRepository;
final class LoginUserHandler { public function __construct(private UserRepository $users, private PasswordHasher $hasher, private TransactionManager $tx) {} public function handle(LoginUserCommand $command): LoginUserResult { return $this->tx->transactional(function () use ($command): LoginUserResult { $user = $this->users->byEmail(Email::fromString($command->email)); if ($user === null || !$this->hasher->verify($command->plainPassword, $user->passwordHash()->value())) { throw new InvalidCredentials('Invalid credentials'); } return new LoginUserResult($user->id()->value()); }); }}
