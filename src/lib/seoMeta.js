// Единственный источник правды для title/description по языку и маршруту.
// Используется в двух местах, которые не могут импортировать друг у друга:
//   - src/App.jsx (браузер, React) — обновляет document.title на лету при
//     смене языка/маршрута для уже загруженного SPA.
//   - scripts/prerender-meta.mjs (Node, во время сборки) — печёт по одному
//     статическому HTML на публичный маршрут с ПРАВИЛЬНЫМИ тегами в <head>
//     ещё до того, как загрузится JS. Без этого шага краулеры, которые не
//     исполняют JS (Facebook/Slack/Twitter при анфёрле ссылки), всегда видят
//     мета лендинга — даже если поделились ссылкой на /pricing.
//
// Именно поэтому файл — чистый ES-модуль без JSX и без импортов React: его
// грузит напрямую Node в scripts/prerender-meta.mjs.

export const META = {
  RU: {
    code: "ru",
    title: "Lesson Planner — планы уроков, тесты и отчёты за минуту",
    desc: "AI-платформа для учителей Казахстана: план урока за 60 секунд, тесты с кодом доступа без регистрации учеников, готовый отчёт для Кунделик.",
  },
  KZ: {
    code: "kk",
    title: "Lesson Planner — сабақ жоспарлары, тесттер және есептер бір минутта",
    desc: "Қазақстан мұғалімдеріне арналған AI-платформа: 60 секундта сабақ жоспары, кодпен кіретін тесттер, Кунделикке дайын есеп.",
  },
  EN: {
    code: "en",
    title: "Lesson Planner — lesson plans, quizzes and reports in a minute",
    desc: "AI platform for teachers in Kazakhstan: a lesson plan in 60 seconds, quizzes with an access code and no student signup, a ready report for Kundelik.",
  },
};

// Оверрайды title/description по маршруту — только для страниц, реально
// доступных без аккаунта (см. public/sitemap.xml и scripts/prerender-meta.mjs).
// Остальные роуты сидят за <Protected> и разворачивают гостя на лендинг, так
// что общий META для них достаточен.
export const ROUTE_META = {
  "/pricing": {
    RU: { title: "Тарифы — Lesson Planner", desc: "Один тариф, бесплатный: планы уроков без ограничений, AI-тесты с кодом доступа, итоги уроков и экспорт в DOCX." },
    KZ: { title: "Тарифтер — Lesson Planner", desc: "Бір тариф, тегін: шектеусіз сабақ жоспарлары, кодпен кіретін AI-тесттер, сабақ қорытындылары және DOCX-ке экспорт." },
    EN: { title: "Pricing — Lesson Planner", desc: "One plan, free: unlimited lesson plans, AI quizzes with an access code, lesson summaries, and DOCX export." },
  },
  "/join-test": {
    RU: { title: "Войти в тест — Lesson Planner", desc: "Введите код доступа от учителя и имя — без регистрации и пароля." },
    KZ: { title: "Тестке кіру — Lesson Planner", desc: "Мұғалімнен алған кодты және атыңызды енгізіңіз — тіркеусіз және парольсіз." },
    EN: { title: "Join a quiz — Lesson Planner", desc: "Enter the access code from your teacher and your name — no signup, no password." },
  },
  "/privacy": {
    RU: { title: "Политика конфиденциальности — Lesson Planner", desc: "Какие данные мы собираем, зачем и что вы можете с ними сделать." },
    KZ: { title: "Құпиялылық саясаты — Lesson Planner", desc: "Қандай деректерді жинаймыз, не үшін және сіз олармен не істей аласыз." },
    EN: { title: "Privacy policy — Lesson Planner", desc: "What data we collect, why, and what you can do about it." },
  },
  "/terms": {
    RU: { title: "Условия использования — Lesson Planner", desc: "Правила использования сервиса для учителей и учеников." },
    KZ: { title: "Пайдалану шарттары — Lesson Planner", desc: "Мұғалімдер мен оқушыларға арналған қызметті пайдалану ережелері." },
    EN: { title: "Terms of use — Lesson Planner", desc: "Rules for using the service, for teachers and students." },
  },
};

// Публичные маршруты, которые нужно предрендерить статически (см.
// scripts/prerender-meta.mjs) — те же 5, что и в public/sitemap.xml.
// "/" не входит: у неё уже есть свой dist/index.html из обычной сборки Vite.
export const PRERENDER_ROUTES = ["/pricing", "/join-test", "/privacy", "/terms"];

export function resolveMeta(lang, pathname) {
  const base = META[lang] || META.RU;
  const override = ROUTE_META[pathname]?.[lang] || ROUTE_META[pathname]?.RU;
  return { ...base, ...override };
}
