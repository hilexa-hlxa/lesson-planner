<?php
declare(strict_types=1);

namespace App;

/**
 * Разбор теста из markdown, который вернула модель.
 *
 * Порт src/lib/quizParser.js на сервер. Раньше разбор жил только на клиенте,
 * а /api/quiz/join отдавал ученику сырой result_md — вместе с пометками [x],
 * то есть с ключом к ответам. Теперь ключ не покидает сервер: клиент получает
 * только тексты вопросов и вариантов, а правильность считаем здесь.
 *
 * Регулярки намеренно повторяют клиентские, чтобы разбор старых тестов
 * не разъехался с тем, что ученики видели раньше.
 */
final class QuizParser
{
  /** @return list<array{question:string, options:list<string>, correctIndex:int}> */
  public static function parse(?string $markdown): array
  {
    if ($markdown === null || $markdown === '') return [];

    $questions = [];
    $current = null;

    foreach (preg_split("/\r\n|\n|\r/", $markdown) ?: [] as $line) {
      $trimmed = trim($line);
      if ($trimmed === '') continue;

      // Вопрос: "1. Текст", "## Текст", "**1. Текст**"
      if (preg_match('/^(##\s|\*\*|)\d+\.|^##\s/u', $trimmed)) {
        if ($current !== null && count($current['options']) >= 2) {
          $questions[] = $current;
        }

        $text = preg_replace('/^(##\s|\*\*|)\d+\.\s*/u', '', $trimmed, 1);
        $text = preg_replace('/\**$/u', '', (string)$text, 1);
        $text = preg_replace('/^##\s/u', '', (string)$text, 1);

        // Единственное намеренное отличие от старого клиентского разбора:
        // для строки "1. **Текст**" тот срезал только хвостовые звёздочки и
        // показывал ученику "**Текст". Снимаем обрамление целиком.
        $text = trim((string)preg_replace('/^\*+|\*+$/u', '', (string)$text));

        $current = ['question' => $text, 'options' => [], 'correctIndex' => 0];
        continue;
      }

      if ($current === null) continue;

      // Вариант с чекбоксом: "- [x] Ответ"
      if (preg_match('/^[-*]\s*\[([ xX])\]\s*(.+)$/u', $trimmed, $m)) {
        $current['options'][] = trim($m[2]);
        if (strtolower($m[1]) === 'x') {
          $current['correctIndex'] = count($current['options']) - 1;
        }
        continue;
      }

      // Простой список: "- Ответ", "a) Ответ" — правильный помечен ✅ или (correct)
      if (preg_match('/^([-*]|[a-d]\))\s+(.+)$/u', $trimmed, $m)) {
        $text = trim($m[2]);
        $isCorrect = (bool)preg_match('/✅|\(correct\)/iu', $text);
        $current['options'][] = trim((string)preg_replace('/✅|\(correct\)/iu', '', $text));
        if ($isCorrect) {
          $current['correctIndex'] = count($current['options']) - 1;
        }
      }
    }

    if ($current !== null && count($current['options']) >= 2) {
      $questions[] = $current;
    }

    return $questions;
  }

  /**
   * То же самое, но без ключа — единственный вид, который уходит ученику.
   *
   * @param list<array{question:string, options:list<string>, correctIndex:int}> $questions
   * @return list<array{question:string, options:list<string>}>
   */
  public static function withoutAnswers(array $questions): array
  {
    return array_map(
      static fn(array $q): array => ['question' => $q['question'], 'options' => $q['options']],
      $questions
    );
  }
}
