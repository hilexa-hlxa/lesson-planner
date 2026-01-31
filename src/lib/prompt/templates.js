import { DEFAULT_PROMPT_CONFIG } from "./defaults";
import { I18N as t, langWord } from "../i18n";


export function buildPrompt(type, vars, cfg) {
  if (type === "lesson_plan") {
    const c = cfg?.lesson_plan || DEFAULT_PROMPT_CONFIG.lesson_plan;

    const pack = t[vars.lang] || t.RU;
    const secMap = pack?.doc?.sections || t.RU.doc.sections;

    const sections = (c.sections || [])
      .map((key) => `- ${secMap[key] || key}`)
      .join("\n");

    return [
      `Ты — профессиональный методист.`,
      `Составь план урока строго на ${langWord(vars.lang)}.`,
      ``,
      `Данные урока:`,
      `- Предмет: ${vars.subject}`,
      `- Тема: ${vars.topic}`,
      `- Класс: ${vars.grade}`,
      `- Время: ${vars.duration} минут`,
      vars.details ? `- Детали: ${vars.details}` : null,
      ``,
      `Настройки плана:`,
      `- Стиль: ${c.style}`,
      `- Детализация: ${c.detailLevel}`,
      `- Поминутка: ${c.includeTiming ? "да" : "нет"}`,
      `- Дифференциация: ${c.includeDifferentiation ? "да" : "нет"}`,
      `- Оценивание: ${c.includeAssessment ? "да" : "нет"}`,
      `- ДЗ: ${c.includeHomework ? "да" : "нет"}`,
      `- Формат: ${c.markdown ? "Markdown" : "текст"}`,
      ``,
      `Структура (строго соблюдай порядок):`,
      sections,
      ``,
      `Пиши конкретно, без воды.`,
    ].filter(Boolean).join("\n");
  }

  if (type === "tests") {
    const c = cfg?.tests || DEFAULT_PROMPT_CONFIG.tests;

    return [
      `Ты — преподаватель.`,
      `Сгенерируй тест строго на ${langWord(vars.lang)}.`,
      ``,
      `Данные:`,
      `- Предмет: ${vars.subject}`,
      `- Тема: ${vars.topic}`,
      `- Класс: ${vars.grade}`,
      vars.details ? `- Детали: ${vars.details}` : null,
      ``,
      `Настройки теста:`,
      `- Сложность: ${c.difficulty}`,
      `- Всего вопросов: ${c.total}`,
      `- MCQ: ${c.mcq.count} вопросов, вариантов: ${c.mcq.options} (A/B/C/D)`,
      `- Короткий ответ: ${c.short.count}`,
      `- Соответствие: ${c.matching.count}`,
      `- Перемешать: ${c.shuffle ? "да" : "нет"}`,
      `- Ответы в конце: ${c.includeAnswers ? "да" : "нет"}`,
      `- Формат: ${c.markdown ? "Markdown" : "текст"}`,
      ``,
      `Требования:`,
      `- Сначала вопросы, затем отдельный блок "Ответы" (если включено).`,
      `- Вопросы должны соответствовать теме и классу.`,
    ].filter(Boolean).join("\n");
  }

  return "";
}
