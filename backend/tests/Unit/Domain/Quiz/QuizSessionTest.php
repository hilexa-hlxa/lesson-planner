<?php
declare(strict_types=1);
namespace Tests\Unit\Domain\Quiz;
use App\Infrastructure\Persistence\PDO\PdoQuizSessionRepository;
use PDO;
use PHPUnit\Framework\TestCase;
final class QuizSessionTest extends TestCase { public function testAccessCodeHasFourDigits(): void { $pdo=new PDO('sqlite::memory:'); $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION); $pdo->exec('CREATE TABLE quiz_sessions (id TEXT PRIMARY KEY, user_id TEXT, access_code TEXT UNIQUE, expires_at TEXT, status TEXT, topic TEXT, questions_json TEXT)'); $repo=new PdoQuizSessionRepository($pdo); for($i=0;$i<20;$i++){ $code=$repo->generateAccessCode(); self::assertMatchesRegularExpression('/^\d{4}$/',$code); } }}
