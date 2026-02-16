<?php
declare(strict_types=1);

namespace App;

use PhpOffice\PhpWord\TemplateProcessor;

final class DocxExport
{
  public static function exportKmj(array $gen): void
  {
    // 0) Template path
    $templatePath = __DIR__ . '/../templates/kmj.docx';
    if (!is_file($templatePath)) {
      http_response_code(500);
      header('Content-Type: text/plain; charset=utf-8');
      echo "Template not found: {$templatePath}";
      return;
    }

    // 1) Parse payload from result_json
    $payload = self::decodeJson($gen['result_json'] ?? null);
    if (!is_array($payload)) {
      http_response_code(400);
      header('Content-Type: text/plain; charset=utf-8');
      echo "No valid result_json to export.";
      return;
    }

    $lang = (string)($payload['lang'] ?? $gen['lang'] ?? 'RU');
    $meta = is_array($payload['meta'] ?? null) ? $payload['meta'] : [];
    $sec  = is_array($payload['sections'] ?? null) ? $payload['sections'] : [];
    $tl   = is_array($payload['timeline'] ?? null) ? $payload['timeline'] : [];

    // 2) Build labels (NO LLM, only i18n)
    $lbl = self::docLabels($lang);

    $tp = new TemplateProcessor($templatePath);

    // 3) Fill lbl_* placeholders (exactly as in your DOCX)
    foreach ($lbl as $k => $v) {
      $tp->setValue($k, self::esc($v));
    }

    // 4) Fill meta fields (exact placeholders from your DOCX)
    $tp->setValue('subject', self::esc((string)($meta['subject'] ?? $gen['subject'] ?? '')));
    $tp->setValue('lesson_number', self::esc((string)($meta['lesson_number'] ?? ''))); // optional
    $tp->setValue('unit', self::esc((string)($meta['unit'] ?? '')));
    $tp->setValue('date', self::esc((string)($meta['date'] ?? '')));
    $tp->setValue('teacher_name', self::esc((string)($meta['teacher_name'] ?? '')));
    $tp->setValue('grade', self::esc((string)($meta['grade'] ?? $gen['grade'] ?? '')));
    $tp->setValue('present_count', self::esc((string)($meta['present_count'] ?? '')));
    $tp->setValue('absent_count', self::esc((string)($meta['absent_count'] ?? '')));
    $tp->setValue('topic', self::esc((string)($meta['topic'] ?? $gen['topic'] ?? '')));

    $tp->setValue('learning_objectives', self::esc(self::asText($sec['learning_objectives'] ?? $meta['learning_objectives'] ?? '')));
    $tp->setValue('lesson_goal', self::esc(self::asText($sec['lesson_goal'] ?? $meta['lesson_goal'] ?? '')));
    $tp->setValue('values', self::esc(self::asText($sec['values'] ?? $meta['values'] ?? '')));

    // 5) Timeline: your DOCX uses tl_stage, tl_minutes, tl_teacher, tl_student, tl_assessment, tl_resources
    $rows = array_values(array_filter($tl, fn($x) => is_array($x)));
    $n = max(1, count($rows));

    $tp->cloneRow('tl_stage', $n);

    for ($i = 0; $i < $n; $i++) {
      $k = $i + 1;
      $r = $rows[$i] ?? [];

      $tp->setValue("tl_stage#{$k}", self::esc((string)($r['stage'] ?? '')));

      // minutes: support both formats
      $minutes = '';
      if (isset($r['start_min'], $r['end_min'])) {
        $minutes = (string)((int)$r['start_min']) . '-' . (string)((int)$r['end_min']);
      } else {
        $minutes = (string)($r['minutes'] ?? '');
      }
      $tp->setValue("tl_minutes#{$k}", self::esc($minutes));

      $tp->setValue("tl_teacher#{$k}", self::esc(self::asText($r['teacher'] ?? '')));
      $tp->setValue("tl_student#{$k}", self::esc(self::asText($r['student'] ?? '')));
      $tp->setValue("tl_assessment#{$k}", self::esc(self::asText($r['assessment'] ?? '')));
      $tp->setValue("tl_resources#{$k}", self::esc(self::asText($r['resources'] ?? '')));
    }

    // 6) Output file
    $tmp = tempnam(sys_get_temp_dir(), 'kmj_') . '.docx';
    $tp->saveAs($tmp);

    $filename = 'KMJ_' . (string)($gen['id'] ?? 'export') . '.docx';
    header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($tmp));
    readfile($tmp);
    @unlink($tmp);
  }

  private static function docLabels(string $lang): array
  {
    $lang = strtoupper(trim($lang));
    $RU = [
      'lbl_subject' => 'Предмет',
      'lbl_unit' => 'Раздел',
      'lbl_date' => 'Дата',
      'lbl_teacher_name' => 'ФИО учителя',
      'lbl_grade' => 'Класс',
      'lbl_present_count' => 'Присутствуют',
      'lbl_absent_count' => 'Отсутствуют',
      'lbl_topic' => 'Тема урока',
      'lbl_learning_objectives' => 'Цели обучения',
      'lbl_lesson_goal' => 'Цель урока',
      'lbl_values' => 'Ценности',
      'lbl_lesson_flow' => 'Ход урока',
      'lbl_lesson_word' => 'урок',

      'lbl_col_stage_time' => 'Этап / время',
      'lbl_col_teacher' => 'Действия учителя',
      'lbl_col_student' => 'Действия ученика',
      'lbl_col_assessment' => 'Оценивание',
      'lbl_col_resources' => 'Ресурсы',
    ];

    $KZ = [
      'lbl_subject' => 'Пәні',
      'lbl_unit' => 'Бөлімі',
      'lbl_date' => 'Күні',
      'lbl_teacher_name' => 'Педагогтің аты-жөні',
      'lbl_grade' => 'Сынып',
      'lbl_present_count' => 'Қатысқандар саны',
      'lbl_absent_count' => 'Қатыспағандар саны',
      'lbl_topic' => 'Сабақтың тақырыбы',
      'lbl_learning_objectives' => 'Оқу мақсаттары',
      'lbl_lesson_goal' => 'Сабақтың мақсаты',
      'lbl_values' => 'Құндылықтар',
      'lbl_lesson_flow' => 'Сабақ барысы',
      'lbl_lesson_word' => 'сабақ',

      'lbl_col_stage_time' => 'Сабақтың кезеңі/уақыты',
      'lbl_col_teacher' => 'Педагогтің әрекеті',
      'lbl_col_student' => 'Оқушының әрекеті',
      'lbl_col_assessment' => 'Бағалау',
      'lbl_col_resources' => 'Ресурстар',
    ];

    $EN = [
      'lbl_subject' => 'Subject',
      'lbl_unit' => 'Unit',
      'lbl_date' => 'Date',
      'lbl_teacher_name' => 'Teacher name',
      'lbl_grade' => 'Grade',
      'lbl_present_count' => 'Present',
      'lbl_absent_count' => 'Absent',
      'lbl_topic' => 'Lesson topic',
      'lbl_learning_objectives' => 'Learning objectives',
      'lbl_lesson_goal' => 'Lesson goal',
      'lbl_values' => 'Values',
      'lbl_lesson_flow' => 'Lesson flow',
      'lbl_lesson_word' => 'lesson',

      'lbl_col_stage_time' => 'Stage / time',
      'lbl_col_teacher' => 'Teacher actions',
      'lbl_col_student' => 'Student actions',
      'lbl_col_assessment' => 'Assessment',
      'lbl_col_resources' => 'Resources',
    ];

    return $lang === 'KZ' ? $KZ : ($lang === 'EN' ? $EN : $RU);
  }

  private static function decodeJson($raw): ?array
  {
    if (is_array($raw)) return $raw;
    if (!is_string($raw) || $raw === '') return null;
    $x = json_decode($raw, true);
    return is_array($x) ? $x : null;
  }

  private static function asText($v): string
  {
    // if array -> bullet lines, else string
    if (is_array($v)) {
      $arr = array_values(array_filter(array_map('strval', $v), fn($s) => trim($s) !== ''));
      return implode("\n", $arr);
    }
    return (string)$v;
  }

  private static function esc(string $v): string
  {
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  }
}
