// Проверка переменных окружения ПЕРЕД сборкой (см. package.json: "build").
//
// Зачем: VITE_API_BASE_URL читается как `import.meta.env.VITE_API_BASE_URL
// ?? ''` (src/api.js, src/lib/docxExport.js). Отсутствующая переменная давала
// не ошибку сборки, а РАБОЧУЮ сборку, в которой API_PREFIX вырождается в
// "/api" — и все запросы уходят на origin самого фронтенда. Это статика: там
// нет никакого /api, поэтому fetch получает в ответ пустой 200 либо HTML
// SPA-шной 404-й страницы и НЕ бросает исключение. Баг выглядит как успех.
//
// Этот класс бага дважды уезжал в прод. src/lib/__tests__/apiUrls.test.js
// ловит одну его форму — литеральный "/api/" в обход API_PREFIX, — но про
// саму переменную, пустую на момент сборки, тест ничего не знает.
//
// Падать надо здесь, на сборке, а не в браузере у пользователя: фронтенд —
// статика без SSR, и брошенное в рантайме исключение это не сообщение об
// ошибке, а белый экран вместо сайта. Сборка, которая не может работать,
// не должна собираться.
//
// В dev эта проверка не запускается (`npm run dev` → просто vite): там
// переменной нет и не нужно, /api подхватывает прокси Vite (vite.config.js).

const CHECKS = [
  {
    name: "VITE_API_BASE_URL",
    hint: [
      "Origin бэкенда, без хвостового слэша и без /api.",
      "  Render  → сервис lessonlab-frontend → Environment (см. render.yaml)",
      "  Локально → VITE_API_BASE_URL=http://localhost:8000 npm run build",
    ].join("\n"),
    validate(value) {
      let url;
      try {
        url = new URL(value);
      } catch {
        return `должен быть абсолютным URL, а не ${JSON.stringify(value)}`;
      }

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return `схема ${url.protocol} не подходит — нужен http: или https:`;
      }

      // `${base}/api` при base с хвостовым слэшем даёт "//api": путь начинается
      // с двух слэшей и не совпадает ни с одним маршрутом бэкенда — все они
      // прибиты к началу строки (#^/api/...# в backend/public/index.php).
      if (value.endsWith("/")) {
        return "не должен заканчиваться слэшем — иначе путь запроса станет \"//api/...\" и не совпадёт ни с одним маршрутом бэкенда";
      }

      // /api дописывается в коде; если он уже есть в переменной, получится /api/api.
      if (url.pathname !== "/") {
        return `не должен содержать путь (${url.pathname}) — "/api" дописывается в src/api.js`;
      }

      return null;
    },
  },
];

const problems = [];

for (const check of CHECKS) {
  const raw = process.env[check.name];

  if (raw === undefined || raw.trim() === "") {
    problems.push({ check, reason: "не задана (или пустая)" });
    continue;
  }

  const reason = check.validate(raw.trim());
  if (reason) problems.push({ check, reason });
}

if (problems.length > 0) {
  const lines = ["", "Сборка остановлена: проблемы с переменными окружения.", ""];

  for (const { check, reason } of problems) {
    lines.push(`  ✗ ${check.name} — ${reason}`);
    lines.push(check.hint.replace(/^/gm, "    "));
    lines.push("");
  }

  lines.push("Почему это ошибка, а не предупреждение: без этой переменной");
  lines.push("сборка проходит успешно, но все запросы к API уходят на сам");
  lines.push("фронтенд и молча возвращают пустой ответ. Подробности — в шапке");
  lines.push("scripts/check-env.mjs.");
  lines.push("");

  console.error(lines.join("\n"));
  process.exit(1);
}

console.log(`check-env: ok (${CHECKS.map((c) => c.name).join(", ")})`);
