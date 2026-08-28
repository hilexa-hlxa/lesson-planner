import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Регрессионный тест на класс бага, который дважды тихо ломал прод: и
// api.generateStream, и Dashboard'овская кнопка "Выгрузить DOCX" собирали
// путь запроса как буквальный `/api/...`. В dev это работает — proxy Vite
// (vite.config.js) перенаправляет /api/* на локальный бэкенд. В проде
// фронтенд и бэкенд на разных origin (lessonlab-frontend/-backend), никакого
// proxy нет — такой запрос уходит на статический фронтенд-сайт и либо
// возвращает пустой 200 (fetch), либо 404 SPA-страницу (навигация). Оба раза
// баг не бросал ошибку — он тихо возвращал что-то похожее на успех.
//
// Правильный способ везде один: API_PREFIX = `${VITE_API_BASE_URL}/api` из
// src/api.js. Этот тест не проверяет ПРАВИЛЬНОСТЬ путей — только то, что
// никто не собирает fetch()/.href/.open() из буквального "/api/", минуя
// API_PREFIX.
const SRC_DIR = new URL("../..", import.meta.url).pathname;

// api.js — единственное место, где /api живёт буквально: это сама
// ОПРЕДЕЛЕНИЕ API_PREFIX, а не вызов, который его обходит.
const EXEMPT_FILES = new Set(["api.js"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "__tests__" || entry === "node_modules") continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(jsx?|tsx?)$/.test(entry)) out.push(full);
  }
  return out;
}

// Буквальный "/api/" сразу после fetch(, .href = или .open( — то есть путь
// запроса/навигации собран без переменной-префикса. Не триггерится на
// комментарии вида "см. /api/quiz/submit", потому что там нет ни fetch(, ни
// .href =, ни .open( прямо перед строкой.
const DANGEROUS_PATTERN = /(fetch\(\s*[`'"]|\.href\s*=\s*[`'"]|\.open\(\s*[`'"])\/api\//;

describe("no hardcoded /api/ paths outside api.js", () => {
  const files = walk(SRC_DIR).filter(
    (f) => !EXEMPT_FILES.has(f.split("/").pop())
  );

  it(`scanned ${files.length} files under src/`, () => {
    expect(files.length).toBeGreaterThan(50); // sanity check the walk actually found the app
  });

  for (const file of files) {
    const rel = file.replace(SRC_DIR, "");
    it(`${rel} builds API URLs through api.js, not a literal /api/ path`, () => {
      const content = readFileSync(file, "utf8");
      const match = content.match(DANGEROUS_PATTERN);
      expect(
        match,
        `${rel} contains a literal "/api/" passed to fetch()/.href/.open() — ` +
          `this works in dev (Vite's proxy) but silently breaks in production ` +
          `(frontend and backend are different origins). Use API_PREFIX from ` +
          `src/api.js instead, or add a method to src/api.js.`
      ).toBeNull();
    });
  }
});
