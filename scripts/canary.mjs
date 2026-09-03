// Канарейка: раз в час проходит критический путь учителя на ЖИВОМ проде и
// пишет в Telegram, когда он сломался.
//
// Зачем именно это и именно так. В истории репозитория есть коммит
// «45036d4 URGENT: revert u.plan from currentUser() — broke production auth»:
// логин на проде лежал, и узнали об этом не от мониторинга. Юнит-тесты в тот
// момент были зелёные — они и не могли поймать, потому что ломалось на стыке
// кода и реальной схемы базы. Канарейка проверяет ровно этот стык.
//
// Что проверяем (порядок важен — каждый шаг зависит от предыдущего):
//   1. POST /api/auth/login      — логин отдаёт 200 И ставит cookie lp_session
//   2. GET  /api/me              — cookie реально работает, вернулся ТОТ юзер
//   3. GET  /api/generations     — чтение из базы живое
//   4. POST /api/generate/stream — только в дневном прогоне, см. ниже
//   5. POST /api/auth/logout     — за собой прибираем
//
// Шаг 2 проверяет не только код ответа, но и email в теле: именно
// currentUser() ломался в 45036d4, и он умеет возвращать 200 с пустым/чужим
// пользователем. Код ответа этого не покажет.
//
// ГЕНЕРАЦИЯ — отдельным (дневным) прогоном, а не ежечасно. Каждый вызов
// съедает квоту Groq: 15/мес на free, 150/мес на PRO. Ежечасно — это ~720
// запусков в месяц, то есть квота кончилась бы к утру первого дня. Раз в
// сутки — ~30/мес, влезает в PRO с запасом.
//
// Отдельно про ассерт на генерации: поток отдаёт `data: {"type":"error"}` с
// кодом 200 (см. GenerateStream::handle) — сломанная генерация выглядит как
// успешный HTTP-ответ. Поэтому проверяем СОДЕРЖИМОЕ потока, а не статус.
//
// Секреты берём из переменных окружения (в CI — из GitHub Actions secrets),
// в репозиторий они не попадают.

const REQUIRED = ["CANARY_BASE_URL", "CANARY_EMAIL", "CANARY_PASSWORD"];

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const WITH_GENERATION = args.has("--with-generation");

// Render на бесплатном тарифе усыпляет сервис после ~15 минут простоя, и
// первый запрос будит контейнер. Замеряли на живом проде: холодный старт
// ~14 с, но бывает и дольше. Таймаут в 30 с давал бы ложные тревоги на
// совершенно здоровом сервисе — поэтому 90.
const REQUEST_TIMEOUT_MS = 90_000;
// Генерация — это поход в Groq, она законно долгая.
const STREAM_TIMEOUT_MS = 120_000;

function env(name) {
  const v = process.env[name];
  return v === undefined ? "" : v.trim();
}

const missing = REQUIRED.filter((k) => env(k) === "");
if (missing.length > 0) {
  console.error(`canary: не заданы переменные: ${missing.join(", ")}`);
  process.exit(2);
}

const BASE = env("CANARY_BASE_URL").replace(/\/+$/, "");
const EMAIL = env("CANARY_EMAIL");
const PASSWORD = env("CANARY_PASSWORD");

const steps = [];

function record(name, ok, detail, ms) {
  steps.push({ name, ok, detail, ms });
  const mark = ok ? "ok  " : "FAIL";
  console.log(`  ${mark} ${name}${ms !== undefined ? ` (${ms} ms)` : ""}${detail ? ` — ${detail}` : ""}`);
}

class CheckFailed extends Error {}

function fail(message) {
  throw new CheckFailed(message);
}

async function timed(fn) {
  const started = Date.now();
  try {
    return { value: await fn(), ms: Date.now() - started };
  } catch (err) {
    err.elapsedMs = Date.now() - started;
    throw err;
  }
}

// ── Шаги ────────────────────────────────────────────────────────────────────

async function login() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (res.status !== 200) {
    const text = await res.text().catch(() => "");
    fail(`логин вернул HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const body = await res.json().catch(() => null);
  if (!body || body.ok !== true) {
    fail(`логин вернул 200, но тело не {ok:true}: ${JSON.stringify(body)?.slice(0, 200)}`);
  }

  // getSetCookie() — Node 20+. Несколько Set-Cookie в одном ответе иначе
  // склеиваются в одну строку и парсятся неверно.
  const cookies = res.headers.getSetCookie();
  const session = cookies.map((c) => c.split(";")[0]).find((c) => c.startsWith("lp_session="));

  if (!session) {
    fail(`логин вернул 200, но не поставил cookie lp_session (получено: ${cookies.length} cookie)`);
  }

  return session;
}

async function me(cookie) {
  const res = await fetch(`${BASE}/api/me`, {
    headers: { Cookie: cookie },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (res.status !== 200) {
    fail(`/api/me вернул HTTP ${res.status} — сессия не работает`);
  }

  const body = await res.json().catch(() => null);
  if (!body || body.ok !== true || !body.user) {
    fail(`/api/me вернул 200 без user: ${JSON.stringify(body)?.slice(0, 200)}`);
  }

  // Тот ли это пользователь. Ровно здесь ломался currentUser() в 45036d4.
  const got = String(body.user.email ?? "").toLowerCase();
  if (got !== EMAIL.toLowerCase()) {
    fail(`/api/me вернул чужого пользователя: ожидали ${EMAIL}, получили ${got || "(пусто)"}`);
  }

  return body;
}

async function generations(cookie) {
  const res = await fetch(`${BASE}/api/generations?limit=1`, {
    headers: { Cookie: cookie },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (res.status !== 200) fail(`/api/generations вернул HTTP ${res.status}`);

  const body = await res.json().catch(() => null);
  if (!body || body.ok !== true || !Array.isArray(body.items)) {
    fail(`/api/generations вернул 200 без массива items: ${JSON.stringify(body)?.slice(0, 200)}`);
  }

  return body.items.length;
}

async function generation(cookie) {
  const res = await fetch(`${BASE}/api/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      prompt: "Ответь одним словом: OK. Это автоматическая проверка доступности, содержание не важно.",
    }),
    signal: AbortSignal.timeout(STREAM_TIMEOUT_MS),
  });

  if (res.status !== 200) {
    const text = await res.text().catch(() => "");
    fail(`генерация вернула HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const raw = await res.text();

  // Поток: "data: {...}\n\n" построчно (GenerateStream::sendEvent).
  const events = raw
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => {
      try {
        return JSON.parse(line.slice(6));
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const errored = events.find((e) => e.type === "error");
  if (errored) fail(`генерация отдала error внутри 200-го потока: ${errored.message}`);

  const deltas = events.filter((e) => e.type === "delta");
  if (deltas.length === 0) {
    fail(`генерация не отдала ни одного delta-чанка (событий всего: ${events.length})`);
  }

  if (!events.some((e) => e.type === "done")) {
    fail(`поток генерации оборвался без события done (получено ${deltas.length} delta)`);
  }

  return `${deltas.length} чанков`;
}

async function logout(cookie) {
  const res = await fetch(`${BASE}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookie },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (res.status !== 200) fail(`логаут вернул HTTP ${res.status}`);
}

// ── Оповещение ──────────────────────────────────────────────────────────────

async function alert(text) {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId = env("TELEGRAM_CHAT_ID");

  if (DRY_RUN) {
    console.log("\n--- сообщение (--dry-run, не отправляем) ---");
    console.log(text);
    console.log("--- конец ---");
    return;
  }

  if (token === "" || chatId === "") {
    // Молчаливая канарейка бесполезнее отсутствующей: она создаёт ощущение
    // присмотра, которого нет. Поэтому это ошибка, а не предупреждение.
    console.error("canary: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID не заданы — отправить тревогу некуда");
    process.exitCode = 3;
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`canary: Telegram отверг сообщение (HTTP ${res.status}): ${body.slice(0, 300)}`);
    process.exitCode = 3;
    return;
  }

  console.log("canary: тревога отправлена в Telegram");
}

function buildAlert(failedStep, message) {
  const lines = [
    "🔴 <b>LessonLab: критический путь сломан</b>",
    "",
    `<b>Упало:</b> ${failedStep}`,
    `<b>Причина:</b> ${message}`,
    "",
    `<b>Прод:</b> ${BASE}`,
    "",
    "<b>Пройденные шаги:</b>",
  ];

  for (const s of steps) {
    lines.push(`${s.ok ? "✅" : "❌"} ${s.name}${s.ms !== undefined ? ` — ${s.ms} мс` : ""}`);
  }

  const runUrl =
    env("GITHUB_SERVER_URL") && env("GITHUB_REPOSITORY") && env("GITHUB_RUN_ID")
      ? `${env("GITHUB_SERVER_URL")}/${env("GITHUB_REPOSITORY")}/actions/runs/${env("GITHUB_RUN_ID")}`
      : null;

  if (runUrl) {
    lines.push("", `<a href="${runUrl}">Логи прогона</a>`);
  }

  return lines.join("\n");
}

// ── Прогон ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`canary: ${BASE} как ${EMAIL}${WITH_GENERATION ? " (+ генерация)" : ""}`);

  let cookie = null;
  let currentStep = "старт";

  try {
    currentStep = "1. Логин";
    const r1 = await timed(() => login());
    cookie = r1.value;
    record(currentStep, true, "cookie lp_session получена", r1.ms);

    currentStep = "2. Сессия (/api/me)";
    const r2 = await timed(() => me(cookie));
    const usage = r2.value.usage;
    record(currentStep, true, usage ? `квота ${usage.used}/${usage.limit}` : "user получен", r2.ms);

    currentStep = "3. Чтение (/api/generations)";
    const r3 = await timed(() => generations(cookie));
    record(currentStep, true, `${r3.value} записей`, r3.ms);

    if (WITH_GENERATION) {
      currentStep = "4. Генерация (/api/generate/stream)";
      const r4 = await timed(() => generation(cookie));
      record(currentStep, true, r4.value, r4.ms);
    }

    currentStep = "5. Логаут";
    const r5 = await timed(() => logout(cookie));
    record(currentStep, true, "", r5.ms);

    console.log("\ncanary: критический путь жив");
    return 0;
  } catch (err) {
    const isCheck = err instanceof CheckFailed;
    // У сетевых ошибок node сам по себе говорит только «TypeError: fetch
    // failed» — в три часа ночи это не сообщение. Настоящая причина (DNS,
    // отказ в соединении, TLS) лежит в err.cause, её и достаём.
    const cause = err.cause ? ` (${err.cause.code ?? err.cause.message ?? err.cause})` : "";

    const reason = isCheck
      ? err.message
      : err.name === "TimeoutError" || err.name === "AbortError"
        ? `таймаут (> ${Math.round((err.elapsedMs ?? REQUEST_TIMEOUT_MS) / 1000)} с) — сервис не ответил`
        : `${err.name}: ${err.message}${cause}`;

    record(currentStep, false, reason, err.elapsedMs);
    console.error(`\ncanary: УПАЛО на шаге «${currentStep}» — ${reason}`);

    await alert(buildAlert(currentStep, reason));

    // Пытаемся прибрать сессию, но её провал не должен подменять исходную причину.
    if (cookie) await logout(cookie).catch(() => {});

    return 1;
  }
}

main()
  .then((code) => {
    if (code !== 0) process.exitCode = code;
  })
  .catch((err) => {
    console.error("canary: непредвиденная ошибка", err);
    process.exit(1);
  });
