// Отдельный сервис — отдельное подключение к той же базе, что и backend/.
// Не переиспользуем backend/src/DB.php (это PHP, а тут Node) и не тащим сюда
// весь backend как зависимость — только доступ на чтение к той же Postgres.
//
// pg.Pool без явного config читает стандартные libpq-переменные окружения
// (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD) сам — специально оставляем
// это неявным, чтобы не дублировать здесь код парсинга DSN из backend/config.php.
// Значения те же, что уже введены на lessonlab-backend (см. DB_DSN/DB_USER/
// DB_PASS там), просто в 5 отдельных переменных вместо DSN-строки.
"use strict";

const { Pool } = require("pg");

const required = ["PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  // Явная ошибка при старте лучше, чем "у меня не открывается дашборд" без
  // объяснений — Render покажет это в логах деплоя.
  throw new Error(
    `Admin panel: missing DB env vars: ${missing.join(", ")}. ` +
    `Copy these from the lessonlab-backend service's DB_DSN/DB_USER/DB_PASS ` +
    `(same Supabase database) — see README in this folder.`
  );
}

// Supabase pooler требует TLS (со своим набором CA — поэтому rejectUnauthorized:
// false, как и в backend/src/DB.php с его CURLOPT_CAINFO). Локальный Postgres
// для разработки/тестов TLS обычно не поддерживает вовсе — PGSSL=disable снимает
// его явно, а не через магический автодетект.
const sslDisabled = process.env.PGSSL === "disable";

const pool = new Pool({
  ssl: sslDisabled ? false : { rejectUnauthorized: false },
  max: 5, // маленький read-only дашборд, не нужен большой пул
});

pool.on("error", (err) => {
  // Ошибка на простаивающем клиенте пула не должна ронять процесс целиком
  console.error("[db] idle client error", err);
});

module.exports = { pool };
