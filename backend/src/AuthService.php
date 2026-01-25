<?php
declare(strict_types=1);

final class AuthService {
  public function __construct(
    private \PDO $pdo,
    private array $cfg
  ) {}

  private function cookieName(): string {
    return (string)($this->cfg['cookie_name'] ?? 'lp_session');
  }

  private function cookieOptions(int $expiresTs): array {
    return [
      'expires'  => $expiresTs,
      'path'     => '/',
      'secure'   => (bool)($this->cfg['cookie_secure'] ?? false),
      'httponly' => true,
      'samesite' => (string)($this->cfg['cookie_samesite'] ?? 'Lax'),
    ];
  }

  private function setCookie(string $value, int $expiresTs): void {
    setcookie($this->cookieName(), $value, $this->cookieOptions($expiresTs));
  }

  private function clearCookie(): void {
    setcookie($this->cookieName(), '', $this->cookieOptions(time() - 3600));
  }

  private function newRawToken(): string {
    return bin2hex(random_bytes(32));
  }

  private function tokenHash(string $raw): string {
    return hash('sha256', $raw);
  }

  /**
   * Простая "самоочистка" протухших сессий без крона:
   * 1% запросов удаляет истекшие записи.
   */
  private function maybeCleanupSessions(): void {
    try {
      if (random_int(1, 100) === 1) {
        $this->pdo->exec("delete from sessions where expires_at < now()");
      }
    } catch (\Throwable $e) {
      // не ломаем основной flow из-за чистки
      error_log("sessions cleanup failed: " . $e->getMessage());
    }
  }

  public function register(string $email, string $password, ?string $displayName = null): int {
    $email = trim(mb_strtolower($email));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      throw new \DomainException('Invalid email');
    }

    if (mb_strlen($password) < 8) {
      throw new \DomainException('Password must be >= 8 chars');
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $this->pdo->prepare("
      insert into users(email, password_hash, display_name)
      values(:email, :phash, :name)
      on conflict (email) do nothing
      returning id
    ");
    $stmt->execute([
      ':email' => $email,
      ':phash' => $hash,
      ':name'  => $displayName
    ]);

    $userId = $stmt->fetchColumn();

    if (!$userId) {
      // удобно маппить на 409 на уровне роутинга
      throw new \RuntimeException('Email already exists');
    }

    $userId = (int)$userId;

    // роль user по умолчанию
    $this->assignRole($userId, 'user');

    return $userId;
  }

  private function assignRole(int $userId, string $roleCode): void {
    $stmt = $this->pdo->prepare("
      insert into user_roles(user_id, role_id)
      select :uid, r.id from roles r where r.code = :code
      on conflict do nothing
    ");
    $stmt->execute([':uid' => $userId, ':code' => $roleCode]);
  }

  public function login(string $email, string $password): bool {
    $email = trim(mb_strtolower($email));

    $stmt = $this->pdo->prepare("
      select id, password_hash, is_active, lock_until
      from users
      where email = :email
      limit 1
    ");
    $stmt->execute([':email' => $email]);
    $u = $stmt->fetch();

    if (!$u) return false;
    if (!(bool)$u['is_active']) return false;

    if ($u['lock_until'] !== null) {
      $lockUntil = strtotime((string)$u['lock_until']);
      if ($lockUntil !== false && $lockUntil > time()) return false;
    }

    if (!password_verify($password, (string)$u['password_hash'])) {
      $this->onLoginFail((int)$u['id']);
      return false;
    }

    $this->onLoginSuccess((int)$u['id'], $password, (string)$u['password_hash']);
    $this->createSession((int)$u['id']);
    return true;
  }

  private function onLoginFail(int $userId): void {
    $stmt = $this->pdo->prepare("
      update users
      set failed_login_count = failed_login_count + 1,
          lock_until = case
            when failed_login_count + 1 >= 5 then now() + interval '15 minutes'
            else lock_until
          end
      where id = :id
    ");
    $stmt->execute([':id' => $userId]);
  }

  private function onLoginSuccess(int $userId, string $password, string $storedHash): void {
    if (password_needs_rehash($storedHash, PASSWORD_BCRYPT)) {
      $newHash = password_hash($password, PASSWORD_BCRYPT);
      $st = $this->pdo->prepare("update users set password_hash=:h where id=:id");
      $st->execute([':h' => $newHash, ':id' => $userId]);
    }

    $st = $this->pdo->prepare("
      update users
      set failed_login_count=0, lock_until=null, last_login_at=now()
      where id=:id
    ");
    $st->execute([':id' => $userId]);
  }

  private function createSession(int $userId): void {
    $this->maybeCleanupSessions();

    $raw = $this->newRawToken();
    $hash = $this->tokenHash($raw);
    $expiresTs = time() + (int)($this->cfg['session_ttl_seconds'] ?? (60 * 60 * 24 * 7));

    $stmt = $this->pdo->prepare("
      insert into sessions(user_id, session_token_hash, expires_at, ip, user_agent)
      values(:uid, :h, to_timestamp(:exp), :ip, :ua)
    ");
    $stmt->execute([
      ':uid' => $userId,
      ':h'   => $hash,
      ':exp' => $expiresTs,
      ':ip'  => $_SERVER['REMOTE_ADDR'] ?? null,
      ':ua'  => $_SERVER['HTTP_USER_AGENT'] ?? null,
    ]);

    $this->setCookie($raw, $expiresTs);
  }

  public function logout(): void {
    $raw = $_COOKIE[$this->cookieName()] ?? null;

    if (is_string($raw) && $raw !== '') {
      $hash = $this->tokenHash($raw);
      $st = $this->pdo->prepare("delete from sessions where session_token_hash=:h");
      $st->execute([':h' => $hash]);
    }

    $this->clearCookie();
  }

  public function currentUser(): ?array {
    $this->maybeCleanupSessions();

    $raw = $_COOKIE[$this->cookieName()] ?? null;
    if (!$raw || !is_string($raw) || strlen($raw) < 20) return null;

    $hash = $this->tokenHash($raw);

    $st = $this->pdo->prepare("
      select u.id, u.email, u.display_name
      from sessions s
      join users u on u.id = s.user_id
      where s.session_token_hash = :h
        and s.expires_at > now()
        and u.is_active = true
      limit 1
    ");
    $st->execute([':h' => $hash]);
    $u = $st->fetch();
    if (!$u) return null;

    // не пишем в БД на каждый запрос — максимум раз в 60 секунд
    $up = $this->pdo->prepare("
      update sessions
      set last_seen_at = now()
      where session_token_hash = :h
        and (last_seen_at is null or last_seen_at < now() - interval '60 seconds')
    ");
    $up->execute([':h' => $hash]);

    $rs = $this->pdo->prepare("
      select r.code
      from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = :uid
      order by r.code
    ");
    $rs->execute([':uid' => $u['id']]);
    $u['roles'] = array_map(fn($row) => $row['code'], $rs->fetchAll());

    return $u;
  }
}
