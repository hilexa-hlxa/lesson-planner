<?php
declare(strict_types=1);

/**
 * Проверка разбора теста. Запуск:
 *   php backend/extras/tests/quiz_parser_test.php
 *
 * Именно эта функция определяет, какой вариант считается правильным, поэтому
 * ошибка здесь тихо испортит баллы всему классу. Фреймворк не нужен — хватает
 * простых утверждений.
 */

require __DIR__ . '/../../src/QuizParser.php';

$passed = 0;
$failed = 0;

function check(string $name, $actual, $expected): void {
  global $passed, $failed;
  if ($actual === $expected) {
    $passed++;
    echo "  ok   $name\n";
    return;
  }
  $failed++;
  echo "  FAIL $name\n";
  echo "       ожидалось: " . json_encode($expected, JSON_UNESCAPED_UNICODE) . "\n";
  echo "       получено:  " . json_encode($actual,   JSON_UNESCAPED_UNICODE) . "\n";
}

$md = <<<MD
## Тест: Дроби (5 класс)

1. **Что такое дробь?**
   - [ ] Целое число
   - [x] Часть от целого
   - [ ] Отрицательное число

2. **Сколько будет 1/2 + 1/4?**
   - [ ] 2/6
   - [ ] 1/8
   - [x] 3/4

3. Какая дробь больше?
   a) 1/3 ✅
   b) 1/5
   c) 1/8

## Просто заголовок без вариантов
MD;

$q = \App\QuizParser::parse($md);

echo "Разбор теста:\n";
check('количество вопросов (заголовок без вариантов отброшен)', count($q), 3);
check('ключ ответов (позиции намеренно разные)', array_column($q, 'correctIndex'), [1, 2, 0]);
check('обрамляющие ** сняты с текста вопроса', $q[0]['question'], 'Что такое дробь?');
check('вопрос без ** не пострадал', $q[2]['question'], 'Какая дробь больше?');
check('варианты чекбоксов', $q[0]['options'], ['Целое число', 'Часть от целого', 'Отрицательное число']);
check('маркер ✅ убран из текста варианта', $q[2]['options'], ['1/3', '1/5', '1/8']);

echo "\nВид, который уходит ученику:\n";
$public = \App\QuizParser::withoutAnswers($q);
check('ключа correctIndex нет', array_keys($public[0]), ['question', 'options']);
check('в JSON не просачивается correctIndex',
      str_contains(json_encode($public), 'correctIndex'), false);

echo "\nГраничные случаи:\n";
check('пустой ввод', \App\QuizParser::parse(''), []);
check('null', \App\QuizParser::parse(null), []);
check('вопрос с одним вариантом отбрасывается',
      count(\App\QuizParser::parse("1. Вопрос?\n   - [x] Единственный")), 0);
check('без явной пометки правильным считается первый',
      \App\QuizParser::parse("1. Вопрос?\n - [ ] А\n - [ ] Б")[0]['correctIndex'], 0);
check('CRLF разбирается так же',
      count(\App\QuizParser::parse(str_replace("\n", "\r\n", $md))), 3);

echo "\n" . ($failed === 0 ? "ВСЁ ХОРОШО: $passed проверок\n" : "ПРОВАЛЕНО: $failed из " . ($passed + $failed) . "\n");
exit($failed === 0 ? 0 : 1);
