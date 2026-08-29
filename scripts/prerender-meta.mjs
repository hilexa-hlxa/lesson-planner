// Печёт по одному статическому dist/<route>/index.html на каждый публичный
// маршрут из PRERENDER_ROUTES, с правильными <title>/description/canonical/
// OG/Twitter тегами уже в разметке — а не выставленными позже через JS (см.
// SEO-эффект в src/App.jsx).
//
// Зачем: это SPA без SSR. Реальные пользователи и Googlebot — оба исполняют
// JS, так что для них эффект в App.jsx работает как надо. А вот Facebook,
// Slack, Twitter/X и большинство других разворачивателей ссылок JS НЕ
// исполняют — они читают только то, что лежит в исходном HTML. Без этого
// шага ссылка на "/pricing", отправленная в чат, всегда показывала бы
// превью лендинга: dist/index.html один на все маршруты, а его мета —
// общая для "/".
//
// Как это работает технически: каждый сгенерированный файл — точная копия
// dist/index.html с изменённым <head> и тем же <body> (пустой #root + тот
// же хэшированный бандл). Все пути к ассетам в dist/index.html абсолютные
// ("/assets/..."), так что вложенность файла в dist/pricing/index.html
// ничего не ломает. React Router у уже загрузившегося приложения читает
// текущий URL и рендерит нужную страницу как обычно — прогрессивное
// улучшение, а не отдельный рендер-пайплайн. Настоящего SSR/гидратации
// здесь нет: у краулера, который не исполняет JS, просто оказываются
// верные теги в статике; у браузера — тот же SPA, что и всегда.
//
// Запускается после `vite build` (см. package.json: "build").

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolveMeta, PRERENDER_ROUTES } from "../src/lib/seoMeta.js";

const SITE_URL = "https://lessonlab-frontend.onrender.com";
const DIST = new URL("../dist/", import.meta.url);

function replaceOnce(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`prerender-meta: pattern for "${label}" not found in dist/index.html — did the template change?`);
  }
  return html.replace(pattern, replacement);
}

async function main() {
  const templatePath = new URL("index.html", DIST);
  const template = await readFile(templatePath, "utf8");

  for (const route of PRERENDER_ROUTES) {
    const m = resolveMeta("RU", route); // RU — язык по умолчанию, как в App.jsx при пустом localStorage
    const url = `${SITE_URL}${route}`;

    let html = template;
    html = replaceOnce(html, /<title>.*?<\/title>/s, `<title>${m.title}</title>`, "title");
    html = replaceOnce(
      html,
      /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${m.desc}" />`,
      "meta description"
    );
    html = replaceOnce(
      html,
      /<link rel="canonical" href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${url}" />`,
      "canonical"
    );
    html = replaceOnce(html, /<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`, "og:url");
    html = replaceOnce(html, /<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${m.title}" />`, "og:title");
    html = replaceOnce(
      html,
      /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${m.desc}" />`,
      "og:description"
    );
    html = replaceOnce(html, /<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${m.title}" />`, "twitter:title");
    html = replaceOnce(
      html,
      /<meta name="twitter:description" content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${m.desc}" />`,
      "twitter:description"
    );

    const outDir = new URL(`.${route}/`, DIST);
    await mkdir(outDir, { recursive: true });
    await writeFile(new URL("index.html", outDir), html, "utf8");
    console.log(`prerender-meta: wrote dist${route}/index.html`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
