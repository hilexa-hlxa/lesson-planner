import { describe, it, expect } from "vitest";
import { payloadToMarkdown } from "../lessonPlanDoc";
import { buildPrompt } from "../prompt";
import { DEFAULT_PROMPT_CONFIG } from "../prompt/defaults";
import { achievementText, achievementReward } from "../achievements";

// Разбор теста живёт на сервере (backend/src/QuizParser.php). Здесь держим
// образец разметки и ожидаемый ключ: если формат промпта для тестов поменяют,
// эти ожидания придётся обновить осознанно, а не заметить это на уроке.
export const SAMPLE_QUIZ_MD = `## Тест: Дроби (5 класс)

1. **Что такое дробь?**
   - [ ] Целое число
   - [x] Часть от целого
   - [ ] Отрицательное число

2. **Сколько будет 1/2 + 1/4?**
   - [ ] 2/6
   - [x] 3/4
   - [ ] 1/8
`;

describe("payloadToMarkdown", () => {
  const base = {
    meta: { subject: "Математика", topic: "Дроби", grade: 5, duration: 45 },
    sections: {
      goals: ["Познакомить с дробью"],
      equipment: ["Доска"],
      key_concepts: ["Числитель"],
      tasks: ["Задача 1"],
      differentiation: [],
      assessment: ["Опрос"],
      homework: [],
    },
    timeline: [
      { stage: "Введение", minutes: "0-5", teacher: ["Говорит"], student: ["Слушает"], assessment: [], resources: [] },
    ],
  };
  const headings = (md) => md.split("\n").filter(l => l.startsWith("## ")).map(l => l.slice(3));

  it("не печатает секции, которые учитель отключил", () => {
    const h = headings(payloadToMarkdown(base, "RU"));
    expect(h).toContain("Цели урока");
    // differentiation и homework пришли пустыми — заголовков быть не должно
    expect(h.join("|")).not.toMatch(/Дифференциац|Домашнее/i);
  });

  it("держит колонку Minutes, когда тайминг заполнен", () => {
    const header = payloadToMarkdown(base, "RU").split("\n").find(l => l.startsWith("| Stage"));
    expect(header).toContain("Minutes");
  });

  it("убирает колонку Minutes и не ломает ширину строк, когда тайминга нет", () => {
    const md = payloadToMarkdown({ ...base, timeline: [{ ...base.timeline[0], minutes: "" }] }, "RU");
    const header = md.split("\n").find(l => l.startsWith("| Stage"));
    const row = md.split("\n").find(l => l.startsWith("| Введение"));
    expect(header).not.toContain("Minutes");
    expect(row.split("|").length).toBe(header.split("|").length);
  });

  it("не рисует пустую таблицу без timeline", () => {
    const md = payloadToMarkdown({ ...base, timeline: [] }, "RU");
    expect(md.split("\n").filter(l => l.startsWith("|"))).toHaveLength(0);
  });
});

describe("buildPrompt: настройки со страницы /prompts доходят до модели", () => {
  const vars = { lang: "RU", subject: "Математика", topic: "Дроби", grade: "5", duration: "45", details: "" };
  const plan = (o) => buildPrompt("lesson_plan", vars, { lesson_plan: { ...DEFAULT_PROMPT_CONFIG.lesson_plan, ...o } });

  it("подставляет тон под выбранный стиль", () => {
    expect(plan({ style: "short" })).toMatch(/Tone:.*Terse/);
    expect(plan({ style: "friendly" })).toMatch(/Tone:.*conversational/);
  });

  it("меняет длину плана по уровню детализации", () => {
    expect(plan({ detailLevel: "low" })).toContain("timeline MUST contain 6 items");
    expect(plan({ detailLevel: "high" })).toContain("timeline MUST contain 8-10 items");
  });

  it("просит убрать минуты, когда тайминг выключен", () => {
    expect(plan({ includeTiming: true })).toMatch(/MUST carry a minute range/);
    expect(plan({ includeTiming: false })).toMatch(/leave "minutes" as ""/);
  });

  it("перечисляет выключенные секции и молчит, когда всё включено", () => {
    expect(plan({ includeHomework: false, includeDifferentiation: false }))
      .toMatch(/turned them off: differentiation, homework/);
    expect(plan({})).not.toMatch(/turned them off/);
  });

  it("не задевает ветку тестов", () => {
    const q = buildPrompt("tests", vars, { tests: { ...DEFAULT_PROMPT_CONFIG.tests, total: 7, difficulty: "hard" } });
    expect(q).toContain("Question Count: 7");
    expect(q).toContain("Difficulty: hard");
  });
});

describe("achievements", () => {
  it("даёт название на языке интерфейса", () => {
    expect(achievementText("perfect_score", "RU").title).toBe("Высший пилотаж");
    expect(achievementText("perfect_score", "EN").title).toBe("Perfect run");
    expect(achievementText("perfect_score", "KZ").title).toBe("Жоғары шеберлік");
  });

  it("откатывается на русский для неизвестного языка и не падает на неизвестном ключе", () => {
    expect(achievementText("night_owl", "FR").title).toBe("Ночная смена");
    expect(achievementText("nope", "EN")).toEqual({ title: "nope", desc: "" });
    expect(achievementReward("nope")).toBe(0);
  });
});
