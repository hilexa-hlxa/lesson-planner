import { DEFAULT_PROMPT_CONFIG } from "./defaults";
import { I18N as t, langWord } from "../i18n";

export function buildPrompt(type, vars, cfg) {
  // 1. ГЕНЕРАЦИЯ ПЛАНА УРОКА
  if (type === "lesson_plan") {
    const c = cfg?.lesson_plan || DEFAULT_PROMPT_CONFIG.lesson_plan;
    const pack = t[vars.lang] || t.RU;
    const secMap = pack?.doc?.sections || t.RU.doc.sections;

    const sections = (c.sections || [])
      .map((key) => `- ${secMap[key] || key}`)
      .join("\n");

    return [
      `Ты — профессиональный методист.`,
      `Составь план урока строго на языке: ${langWord(vars.lang)}.`,
      ``,
      `Данные урока:`,
      `- Предмет: ${vars.subject}`,
      `- Тема: ${vars.topic}`,
      `- Класс: ${vars.grade}`,
      `- Время: ${vars.duration} минут`,
      vars.details ? `- Детали: ${vars.details}` : null,
      ``,
      `Настройки:`,
      `- Детализация: ${c.detailLevel}`,
      `- Структура (соблюдай порядок):\n${sections}`,
      ``,
      `Пиши конкретно, используй Markdown (жирный шрифт для заголовков).`,
    ].filter(Boolean).join("\n");
  }

  // 2. ГЕНЕРАЦИЯ ТЕСТА (ИСПРАВЛЕНИЕ ДУБЛИКАТОВ)
  if (type === "tests") {
    const c = cfg?.tests || DEFAULT_PROMPT_CONFIG.tests;
    const totalQ = c.total || 10;

    return [
      `Роль: Генератор тестов.`,
      `Задача: Создать тест на языке: ${langWord(vars.lang)}.`,
      ``,
      `Вводные данные:`,
      `- Предмет: ${vars.subject}`,
      `- Тема: ${vars.topic}`,
      `- Класс: ${vars.grade}`,
      `- Количество вопросов: ${totalQ}`,
      `- Сложность: ${c.difficulty}`,
      vars.details ? `- Контекст: ${vars.details}` : null,
      ``,
      `КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ФОРМАТА:`,
      `1. Не пиши никаких вступлений. Сразу начинай с вопросов.`,
      `2. Правильный ответ помечай СРАЗУ внутри вопроса (крестиком [x]).`,
      `3. Используй строго этот формат Markdown:`,
      ``,
      `## Текст вопроса?`,
      `- [ ] Неправильный вариант`,
      `- [x] Правильный вариант`,
      `- [ ] Неправильный вариант`,
      ``,
      `4. Вопросов должно быть ровно ${totalQ}.`,
      `5. ВАЖНО: Все варианты ответов внутри одного вопроса должны быть РАЗНЫМИ (УНИКАЛЬНЫМИ). Дубликаты запрещены!`,
      `6. Если вопрос математический, убедись, что правильный ответ только один.`,
    ].filter(Boolean).join("\n");
  }

  return "";
}