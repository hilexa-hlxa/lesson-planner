<?php

declare(strict_types=1);

namespace App\Bootstrap;

use App\Application\Achievements\GrantAchievement\GrantAchievementHandler;
use App\Application\Auth\LoginUser\LoginUserHandler;
use App\Application\Auth\RegisterUser\RegisterUserHandler;
use App\Application\Comments\AddComment\AddCommentHandler;
use App\Application\Economy\AddCoins\AddCoinsHandler;
use App\Application\Economy\GetCoins\GetCoinsHandler;
use App\Application\Generations\CreateGeneration\CreateGenerationHandler;
use App\Application\Generations\DeleteGeneration\DeleteGenerationHandler;
use App\Application\Generations\ExportGenerationDocx\ExportGenerationDocxHandler;
use App\Application\Generations\GenerateLessonStream\GenerateLessonStreamHandler;
use App\Application\Generations\GetGeneration\GetGenerationHandler;
use App\Application\Generations\ListGenerations\ListGenerationsHandler;
use App\Application\Generations\UpdateGeneration\UpdateGenerationHandler;
use App\Application\Groups\CreateGroup\CreateGroupHandler;
use App\Application\Posts\CreatePost\CreatePostHandler;
use App\Application\Quiz\ExportQuizReport\ExportQuizReportHandler;
use App\Application\Quiz\GetQuizReport\GetQuizReportHandler;
use App\Application\Quiz\JoinQuiz\JoinQuizHandler;
use App\Application\Quiz\StartQuiz\StartQuizHandler;
use App\Application\Quiz\SubmitQuiz\SubmitQuizHandler;
use App\Infrastructure\Export\PhpWordGenerationDocxExporter;
use App\Infrastructure\Generation\GeminiGenerationService;
use App\Infrastructure\Persistence\PDO\PdoAuditLogRepository;
use App\Infrastructure\Persistence\PDO\PdoCommentRepository;
use App\Infrastructure\Persistence\PDO\PdoGenerationRepository;
use App\Infrastructure\Persistence\PDO\PdoGroupRepository;
use App\Infrastructure\Persistence\PDO\PdoPostRepository;
use App\Infrastructure\Persistence\PDO\PdoQuizResultRepository;
use App\Infrastructure\Persistence\PDO\PdoQuizSessionRepository;
use App\Infrastructure\Persistence\PDO\PdoTransactionManager;
use App\Infrastructure\Persistence\PDO\PdoUserAchievementRepository;
use App\Infrastructure\Persistence\PDO\PdoUserRepository;
use App\Infrastructure\Persistence\PDO\PdoWalletRepository;
use App\Infrastructure\Security\BcryptPasswordHasher;
use App\Interfaces\Http\Controller\Achievements\GrantAchievementController;
use App\Interfaces\Http\Controller\AddCommentController;
use App\Interfaces\Http\Controller\Auth\LoginUserController;
use App\Interfaces\Http\Controller\Auth\RegisterUserController;
use App\Interfaces\Http\Controller\CreateGroupController;
use App\Interfaces\Http\Controller\CreatePostController;
use App\Interfaces\Http\Controller\CurrentUser\GetCurrentUserController;
use App\Interfaces\Http\Controller\Economy\AddCoinsController;
use App\Interfaces\Http\Controller\Economy\GetCoinsController;
use App\Interfaces\Http\Controller\Generations\CreateGenerationController;
use App\Interfaces\Http\Controller\Generations\DeleteGenerationController;
use App\Interfaces\Http\Controller\Generations\ExportGenerationDocxController;
use App\Interfaces\Http\Controller\Generations\GenerateLessonStreamController;
use App\Interfaces\Http\Controller\Generations\GetGenerationController;
use App\Interfaces\Http\Controller\Generations\ListGenerationsController;
use App\Interfaces\Http\Controller\Generations\UpdateGenerationController;
use App\Interfaces\Http\Controller\Quiz\ExportQuizReportController;
use App\Interfaces\Http\Controller\Quiz\GetQuizReportController;
use App\Interfaces\Http\Controller\Quiz\JoinQuizController;
use App\Interfaces\Http\Controller\Quiz\StartQuizController;
use App\Interfaces\Http\Controller\Quiz\SubmitQuizController;
use PDO;

final class Container
{
    public function __construct(private array $config)
    {
    }

    private function pdo(): PDO
    {
        $dsn = $this->config['db']['dsn'] ?? null;
        $user = $this->config['db']['user'] ?? null;
        $pass = $this->config['db']['pass'] ?? null;
        $timeout = (int) ($this->config['db']['timeout'] ?? 5);

        return new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => $timeout > 0 ? $timeout : 5,
        ]);
    }

    public function registerUserController(): RegisterUserController { $pdo=$this->pdo(); return new RegisterUserController(new RegisterUserHandler(new PdoUserRepository($pdo), new BcryptPasswordHasher(), new PdoTransactionManager($pdo), new PdoAuditLogRepository($pdo))); }
    public function loginUserController(): LoginUserController { $pdo=$this->pdo(); return new LoginUserController(new LoginUserHandler(new PdoUserRepository($pdo), new BcryptPasswordHasher(), new PdoTransactionManager($pdo))); }
    public function createPostController(): CreatePostController { $pdo=$this->pdo(); return new CreatePostController(new CreatePostHandler(new PdoPostRepository($pdo), new PdoTransactionManager($pdo), new PdoAuditLogRepository($pdo))); }
    public function addCommentController(): AddCommentController { $pdo=$this->pdo(); return new AddCommentController(new AddCommentHandler(new PdoCommentRepository($pdo), new PdoTransactionManager($pdo), new PdoAuditLogRepository($pdo))); }
    public function createGroupController(): CreateGroupController { $pdo=$this->pdo(); return new CreateGroupController(new CreateGroupHandler(new PdoGroupRepository($pdo), new PdoTransactionManager($pdo), new PdoAuditLogRepository($pdo))); }

    public function createGenerationController(): CreateGenerationController { $pdo=$this->pdo(); return new CreateGenerationController(new CreateGenerationHandler(new PdoGenerationRepository($pdo), new PdoTransactionManager($pdo), new PdoAuditLogRepository($pdo))); }
    public function listGenerationsController(): ListGenerationsController { $pdo=$this->pdo(); return new ListGenerationsController(new ListGenerationsHandler(new PdoGenerationRepository($pdo))); }
    public function getGenerationController(): GetGenerationController { $pdo=$this->pdo(); return new GetGenerationController(new GetGenerationHandler(new PdoGenerationRepository($pdo))); }
    public function updateGenerationController(): UpdateGenerationController { $pdo=$this->pdo(); return new UpdateGenerationController(new UpdateGenerationHandler(new PdoGenerationRepository($pdo), new PdoTransactionManager($pdo), new PdoAuditLogRepository($pdo))); }
    public function deleteGenerationController(): DeleteGenerationController { $pdo=$this->pdo(); return new DeleteGenerationController(new DeleteGenerationHandler(new PdoGenerationRepository($pdo))); }
    public function exportGenerationDocxController(): ExportGenerationDocxController { $pdo=$this->pdo(); return new ExportGenerationDocxController(new ExportGenerationDocxHandler(new PdoGenerationRepository($pdo), new PhpWordGenerationDocxExporter())); }
    public function generateLessonStreamController(): GenerateLessonStreamController { return new GenerateLessonStreamController(new GenerateLessonStreamHandler(new GeminiGenerationService(
            $this->config['gemini']['api_key'] ?? null,
            $this->config['gemini']['model'] ?? 'gemini-2.0-flash',
            $this->config['ssl']['cafile'] ?? null,
            $this->config['cache']['redis_host'] ?? null,
            (int) ($this->config['cache']['redis_port'] ?? 6379),
            (int) ($this->config['cache']['generation_ttl'] ?? 900),
        ))); }

    public function startQuizController(): StartQuizController { $pdo=$this->pdo(); return new StartQuizController(new StartQuizHandler(new PdoQuizSessionRepository($pdo))); }
    public function joinQuizController(): JoinQuizController { $pdo=$this->pdo(); return new JoinQuizController(new JoinQuizHandler(new PdoQuizSessionRepository($pdo))); }
    public function submitQuizController(): SubmitQuizController { $pdo=$this->pdo(); return new SubmitQuizController(new SubmitQuizHandler(new PdoQuizSessionRepository($pdo), new PdoQuizResultRepository($pdo))); }
    public function getQuizReportController(): GetQuizReportController { $pdo=$this->pdo(); return new GetQuizReportController(new GetQuizReportHandler(new PdoQuizResultRepository($pdo))); }
    public function exportQuizReportController(): ExportQuizReportController { $pdo=$this->pdo(); return new ExportQuizReportController(new ExportQuizReportHandler(new PdoQuizResultRepository($pdo))); }

    public function getCoinsController(): GetCoinsController { $pdo=$this->pdo(); return new GetCoinsController(new GetCoinsHandler(new PdoWalletRepository($pdo))); }
    public function addCoinsController(): AddCoinsController { $pdo=$this->pdo(); return new AddCoinsController(new AddCoinsHandler(new PdoWalletRepository($pdo))); }
    public function grantAchievementController(): GrantAchievementController { $pdo=$this->pdo(); return new GrantAchievementController(new GrantAchievementHandler(new PdoUserAchievementRepository($pdo), new PdoWalletRepository($pdo))); }
    public function currentUserController(): GetCurrentUserController { $pdo=$this->pdo(); return new GetCurrentUserController(new PdoUserRepository($pdo)); }
}
