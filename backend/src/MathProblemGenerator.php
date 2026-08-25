<?php
declare(strict_types=1);

namespace App;

/**
 * Генератор арифметических задач для Math Battle.
 *
 * Пул задач и ответы создаются один раз на сервере при старте дуэли и хранятся
 * в math_battle_sessions.problems_json — так же, как ответы теста никогда не
 * уходят клиенту раньше времени (см. QuizParser::withoutAnswers). Иначе игрок
 * мог бы подправить свой ответ прямо в devtools и выиграть дуэль без единого
 * решённого примера.
 *
 * Соло-режим задачи не генерирует здесь вообще — там нет соперника, которого
 * можно обмануть, поэтому вопросы там честно живут только в браузере.
 */
final class MathProblemGenerator
{
  /**
   * @return list<array{question: string, answer: int}>
   */
  public static function generate(int $grade, int $count): array
  {
    if ($grade <= 4) {
      $ops = ['+', '-'];
      $max = 20;
      $factorMax = 5;
    } elseif ($grade <= 7) {
      $ops = ['+', '-', '*', '/'];
      $max = 50;
      $factorMax = 12;
    } else {
      $ops = ['+', '-', '*', '/'];
      $max = 100;
      $factorMax = 20;
    }

    $problems = [];
    for ($i = 0; $i < $count; $i++) {
      $op = $ops[array_rand($ops)];

      switch ($op) {
        case '+':
          $a = random_int(1, $max);
          $b = random_int(1, $max);
          $answer = $a + $b;
          break;
        case '-':
          // b <= a — держим результат неотрицательным, это тренажёр, а не ловушка
          $a = random_int(1, $max);
          $b = random_int(0, $a);
          $answer = $a - $b;
          break;
        case '*':
          $a = random_int(2, $factorMax);
          $b = random_int(2, $factorMax);
          $answer = $a * $b;
          break;
        default: // '/'
          $b = random_int(2, $factorMax);
          $answer = random_int(2, $factorMax);
          $a = $b * $answer; // конструируем чётное деление, а не проверяем его
          $op = ':'; // визуально отличаем деление от Wordle-подобной путаницы с '/'
      }

      $problems[] = ['question' => "{$a} {$op} {$b}", 'answer' => $answer];
    }

    return $problems;
  }
}
