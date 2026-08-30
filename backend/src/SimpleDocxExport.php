<?php
declare(strict_types=1);

namespace App;

use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;

/**
 * Экспорт произвольного markdown-ish текста в .docx без шаблона — в отличие
 * от DocxExport (жёстко привязан к схеме lessonlab.kmj.v1 и файлу-шаблону),
 * это просто конвертер строк в параграфы/заголовки/списки. Нужен нескольким
 * новым инструментам (Worksheet, Rubric, Flashcards и т.д.), у которых нет
 * фиксированной DOCX-формы — только сгенерированный текст.
 */
final class SimpleDocxExport
{
  public static function export(string $title, string $content): void
  {
    $phpWord = new PhpWord();
    $section = $phpWord->addSection();

    $section->addTitle(self::clean($title), 1);

    foreach (explode("\n", str_replace(["\r\n", "\r"], "\n", $content)) as $line) {
      $trimmed = trim($line);

      if ($trimmed === '') {
        $section->addTextBreak();
        continue;
      }

      if (preg_match('/^(#{1,3})\s+(.*)$/', $trimmed, $m)) {
        $section->addTitle(self::clean($m[2]), strlen($m[1]) + 1);
        continue;
      }

      if (preg_match('/^[-*]\s+(.*)$/', $trimmed, $m)) {
        $section->addListItem(self::clean($m[1]), 0, null, 'listBullet');
        continue;
      }

      if (preg_match('/^\d+[.)]\s+(.*)$/', $trimmed, $m)) {
        $section->addListItem(self::clean($m[1]), 0, null, 'listNumber');
        continue;
      }

      // **bold** внутри строки — грубая замена без вложенного парсинга, но
      // достаточно для текста, который выдаёт Groq
      $section->addText(self::clean(preg_replace('/\*\*(.+?)\*\*/', '$1', $trimmed)));
    }

    $tmp = tempnam(sys_get_temp_dir(), 'doc_') . '.docx';
    IOFactory::createWriter($phpWord, 'Word2007')->save($tmp);

    $filename = preg_replace('/[^\p{L}\p{N}_-]+/u', '_', $title) ?: 'export';

    header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    header('Content-Disposition: attachment; filename="' . $filename . '.docx"');
    header('Content-Length: ' . filesize($tmp));
    readfile($tmp);
    @unlink($tmp);
  }

  private static function clean(string $v): string
  {
    return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  }
}
