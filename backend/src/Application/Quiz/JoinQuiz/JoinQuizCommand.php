<?php
declare(strict_types=1);
namespace App\Application\Quiz\JoinQuiz;
final class JoinQuizCommand { public function __construct(public string $accessCode) {} }
