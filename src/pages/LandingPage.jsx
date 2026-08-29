import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileQuestion, ClipboardList, Gamepad2, Plus, Minus, Check } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PlansComparison from "../components/PlansComparison";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, delay },
});

// ─── copy ─────────────────────────────────────────────────────────────────────
const COPY = {
  RU: {
    badge: "Для учителей Казахстана",
    h1a: "Хватит тратить",
    h1b: "вечера на уроки.",
    sub: "Lesson Planner генерирует планы, тесты и отчёты за секунды. Вы просто приходите на урок.",
    cta: "Попробовать бесплатно",
    ctaSub: "Без карты · Регистрация за 30 секунд",
    stats: [
      { n: "60с", t: "вместо 2 часов на план урока" },
      { n: "3", t: "языка — RU, KZ, EN" },
      { n: "0₸", t: "стоит прямо сейчас" },
    ],
    f1tag: "Планы уроков",
    f1h: "Полный план — пока закипает чайник.",
    f1p: "Введи предмет и тему. Через 60 секунд у тебя структурированный план с целями, ходом урока, дифференциацией и домашним заданием. Забери в DOCX одной кнопкой.",
    f1b: ["Цели и ожидаемые результаты","Пошаговый ход урока","Дифференциация по уровням","Экспорт в DOCX"],

    f2tag: "AI Тесты",
    f2h: "Покажи код — и класс уже в тесте.",
    f2p: "Создаёшь тест, запускаешь сессию, показываешь 4-значный код. Ученики заходят с телефона без регистрации. Результаты приходят сразу.",
    f2b: ["Генерация теста по теме","Код доступа — никакой регистрации","Результаты в реальном времени","AI-отчёт по классу одной кнопкой"],

    f3tag: "Итог урока",
    f3h: "ИИ пишет отчёт. Ты копируешь в Кунделик.",
    f3p: "После теста нажимаешь одну кнопку — ИИ сам анализирует результаты и пишет: что прошли, кто отстаёт, какое домашнее задание. Формат готов для Кунделик.",
    f3b: ["Анализ класса за секунды","Список кому нужна помощь","Готовое домашнее задание","Копируй прямо в Кунделик"],

    f4tag: "Игры",
    f4h: "Вордл, викторины. Прямо на уроке.",
    f4p: "Вордл для класса — задаёшь слово, ученики угадывают со своих телефонов. Или соло-режим с рандомным словом из банка. Три языка, без установок.",
    f4b: ["Вордл для класса и в соло","Три языка: RU, KZ, EN","Ученики играют со своих телефонов","Ничего устанавливать не нужно"],

    how: "Три шага — и вы готовы",
    s1t: "Создайте аккаунт", s1d: "30 секунд. Без карты. Просто почта и пароль.",
    s2t: "Сгенерируйте контент", s2d: "Предмет + тема — и ИИ за минуту выдаёт план или тест.",
    s3t: "Ведите урок", s3d: "Запустите тест, смотрите результаты, получите итог.",

    faqT: "Часто спрашивают",
    faq: [
      { q: "Это правда бесплатно?", a: "Да, полностью. Никаких скрытых платежей, никаких ограничений по времени." },
      { q: "Ученикам нужен аккаунт для теста?", a: "Нет. Достаточно 4-значного кода — вводят имя и сразу начинают." },
      { q: "На каких языках работает ИИ?", a: "Русский, казахский, английский. Переключается в один клик в интерфейсе." },
      { q: "Нужно что-то устанавливать?", a: "Нет. Всё работает в браузере — на компьютере, планшете и телефоне." },
      { q: "Данные в безопасности?", a: "Хранятся в защищённой облачной базе, третьим лицам не передаются." },
    ],
    ctaB: "Начать — это бесплатно",
    ctaBs: "Присоединяйтесь к учителям, которые уже экономят время каждый день.",
  },

  KZ: {
    badge: "Қазақстан мұғалімдері үшін",
    h1a: "Сабаққа дайындалуға",
    h1b: "кеш жұмсауды тоқтат.",
    sub: "Lesson Planner секундтарда жоспарлар, тесттер және есептер жасайды. Сіз тек сабақ өткізесіз.",
    cta: "Тегін байқап көру",
    ctaSub: "Картасыз · 30 секундта тіркелу",
    stats: [
      { n: "60с", t: "сабақ жоспарына 2 сағаттың орнына" },
      { n: "3", t: "тіл — RU, KZ, EN" },
      { n: "0₸", t: "қазір тегін" },
    ],
    f1tag: "Сабақ жоспарлары",
    f1h: "Толық жоспар — шай қайнаған уақытта.",
    f1p: "Пән мен тақырыпты енгізіңіз. 60 секундтан кейін мақсаттары, барысы және үй тапсырмасы бар жоспар дайын. DOCX-ке бір батырмамен.",
    f1b: ["Мақсаттар мен нәтижелер","Кезең-кезең барысы","Деңгей бойынша дифференциация","DOCX экспорты"],

    f2tag: "AI Тесттер",
    f2h: "Кодты көрсет — сынып тестте.",
    f2p: "Тест жасайсың, сессия іске қосасың, 4 санды кодты көрсетесің. Оқушылар тіркелусіз телефоннан кіреді. Нәтижелер бірден келеді.",
    f2b: ["Тақырып бойынша тест жасау","Код — тіркелу жоқ","Нақты уақыттағы нәтижелер","Сынып бойынша AI-есеп"],

    f3tag: "Сабақ қорытындысы",
    f3h: "ЖИ есеп жазады. Сен Кунделикке көшіресің.",
    f3p: "Тесттен кейін бір батырма — ЖИ нәтижелерді талдап есеп жазады: нені өттік, кім артта қалды, үй тапсырмасы. Кунделикке дайын.",
    f3b: ["Секундтарда сынып талдауы","Артта қалған оқушылар","Дайын үй тапсырмасы","Кунделикке тікелей көшіру"],

    f4tag: "Ойындар",
    f4h: "Вордл, викториналар. Сабақта.",
    f4p: "Сынып үшін Вордл — сөз бересің, оқушылар телефондарынан болжайды. Немесе кездейсоқ сөзбен соло режим. Үш тіл, орнатусыз.",
    f4b: ["Сыныппен және соло Вордл","Үш тіл: RU, KZ, EN","Оқушылар телефондарынан ойнайды","Ештеңе орнату керек емес"],

    how: "Үш қадам — дайынсыз",
    s1t: "Тіркелу", s1d: "30 секунд. Картасыз. Тек пошта мен құпия сөз.",
    s2t: "Жасау", s2d: "Пән + тақырып — ЖИ бір минутта жоспар немесе тест жасайды.",
    s3t: "Сабақ", s3d: "Тестті іске қосыңыз, нәтижелерді қараңыз, қорытынды алыңыз.",

    faqT: "Жиі сұрақтар",
    faq: [
      { q: "Бұл шынымен тегін бе?", a: "Иә, толығымен. Жасырын төлемдер жоқ, уақыт шектеулері жоқ." },
      { q: "Тест үшін оқушыларға аккаунт керек пе?", a: "Жоқ. 4 санды код жеткілікті — атын енгізіп бірден бастайды." },
      { q: "ЖИ қандай тілдерде жұмыс істейді?", a: "Орыс, қазақ, ағылшын. Интерфейсте бір батырмамен ауысады." },
      { q: "Бірдеңе орнату керек пе?", a: "Жоқ. Барлығы браузерде жұмыс істейді." },
      { q: "Деректер қауіпсіз бе?", a: "Қорғалған бұлтты дерекқорда сақталады, үшінші тараптарға берілмейді." },
    ],
    ctaB: "Бастау — тегін",
    ctaBs: "Күн сайын уақыт үнемдейтін мұғалімдерге қосылыңыз.",
  },

  EN: {
    badge: "For teachers in Kazakhstan",
    h1a: "Stop spending evenings",
    h1b: "on lesson plans.",
    sub: "Lesson Planner generates plans, quizzes and reports in seconds. You just show up and teach.",
    cta: "Try it for free",
    ctaSub: "No card · Sign up in 30 seconds",
    stats: [
      { n: "60s", t: "instead of 2 hours for a lesson plan" },
      { n: "3", t: "languages — RU, KZ, EN" },
      { n: "free", t: "right now, no strings attached" },
    ],
    f1tag: "Lesson Plans",
    f1h: "Full lesson plan before your tea gets cold.",
    f1p: "Enter subject and topic. In 60 seconds you get a structured plan with goals, lesson flow, differentiation and homework. Export to DOCX in one click.",
    f1b: ["Goals and expected outcomes","Step-by-step lesson flow","Differentiation by level","DOCX export"],

    f2tag: "AI Quizzes",
    f2h: "Show the code — class is already in the quiz.",
    f2p: "Create a quiz, launch a session, show the 4-digit code. Students join from their phones without registration. Results come in instantly.",
    f2b: ["Quiz generation by topic","Access code — no registration","Real-time results","One-click AI class report"],

    f3tag: "Lesson Summary",
    f3h: "AI writes the report. You paste it into Kundelik.",
    f3p: "After the quiz, one click — AI analyzes results and writes: what was covered, who's struggling, homework. Format is ready for Kundelik.",
    f3b: ["Class analysis in seconds","Students who need support","Ready-made homework","Paste directly into Kundelik"],

    f4tag: "Games",
    f4h: "Wordle, quizzes. Right in the lesson.",
    f4p: "Class Wordle — set a word, students guess from their phones. Or solo mode with a random word from the bank. Three languages, no install.",
    f4b: ["Class and solo Wordle","Three languages: RU, KZ, EN","Students play on their phones","Nothing to install"],

    how: "Three steps and you're ready",
    s1t: "Create account", s1d: "30 seconds. No card. Just email and password.",
    s2t: "Generate content", s2d: "Subject + topic — AI produces a plan or quiz in a minute.",
    s3t: "Teach", s3d: "Launch the quiz, watch results, get the summary.",

    faqT: "Common questions",
    faq: [
      { q: "Is it really free?", a: "Yes, completely. No hidden payments, no time limits." },
      { q: "Do students need an account to take a quiz?", a: "No. A 4-digit code is enough — they enter their name and start immediately." },
      { q: "What languages does the AI support?", a: "Russian, Kazakh, English. Switch in one click in the interface." },
      { q: "Do I need to install anything?", a: "No. Everything runs in the browser on any device." },
      { q: "Is the data safe?", a: "Stored in a secure cloud database, never shared with third parties." },
    ],
    ctaB: "Get started — it's free",
    ctaBs: "Join teachers who are already saving hours every day.",
  },
};

// ─── Rotating hero headlines ──────────────────────────────────────────────────
const HEADLINES = {
  RU: [
    { a: "Хватит тратить", b: "вечера на уроки." },
    { a: "Планируй уроки", b: "быстрее с ИИ." },
    { a: "Планы и тесты —", b: "не твоя забота." },
  ],
  KZ: [
    { a: "Сабаққа дайындалуға", b: "кеш жұмсауды тоқтат." },
    { a: "ЖИ-мен сабақты", b: "тиімдірек жоспарла." },
    { a: "Жоспар мен тест —", b: "бір минутта дайын." },
  ],
  EN: [
    { a: "Stop spending evenings", b: "on lesson plans." },
    { a: "Plan lessons faster", b: "with AI." },
    { a: "Plans and quizzes —", b: "not your problem." },
  ],
};

// ─── Mockup copy ──────────────────────────────────────────────────────────────
// Тексты внутри превью-скриншотов. Переключаются вместе с языком интерфейса.
const MOCK = {
  RU: {
    history: "ИСТОРИЯ", params: "ПАРАМЕТРЫ", done: "✓ ГОТОВО",
    topics: ["Дроби", "Периметр", "Площадь", "Углы", "Вектора", "Функции"],
    grade: "5 Класс", gradeShort: "5 кл", classroom: "5А класс", duration: "45 Мин",
    subject: "Математика", topic: "Дроби и части целого", topicShort: "Дроби и части",
    detailsPh: "Детали урока...", contextPh: "Контекст...",
    createPlan: "СОЗДАТЬ ПЛАН", createTest: "СОЗДАТЬ ТЕСТ", create: "СОЗДАТЬ",
    planTitleLong: "## План урока — Дроби и части целого", planTitle: "## План урока",
    planMeta: "Математика · 5 класс · 45 минут",
    goalsTitle: "## Цели урока",
    goalsLong: ["- Познакомить с понятием дроби", "- Формировать навык записи и чтения дробей", "- Развить умение сравнивать дроби"],
    goalsShort: ["- Познакомить с понятием дроби", "- Развить навыки вычислений"],
    flowTitle: "## Ход урока",
    flowLong: [["Организационный момент", "2 мин"], ["Актуализация знаний", "8 мин"], ["Изучение нового материала", "15 мин"], ["Практическая работа", "15 мин"], ["Итоги", "5 мин"]],
    flowShort: [["Введение", "5 мин"], ["Объяснение", "15 мин"], ["Практика", "20 мин"], ["Итоги", "5 мин"]],
    copy: "КОПИРОВАТЬ", exportDocx: "⬇ ВЫГРУЗИТЬ В DOCX",
    code: "код", results: "📊 Результаты",
    summaryTitle: "Итог урока — AI Отчёт",
    summaryHead: "📋 Математика · Дроби · 5А",
    summaryCovered: ["Тема пройдена на ", "82%", " · 14 учеников"],
    needHelp: "⚠ Нужна помощь",
    homework: "📝 Домашнее задание",
    homeworkBody: "Задачник с. 45, №3–7. Повторить правило сравнения дробей.",
    copyKundelik: "Скопировать в Кунделик",
    wordleTitle: "ВОРДЛ — КЛАСС", wordleAnswer: "КНИГА", wordleGuesses: ["КАРТА", "КИНГА", "КНИГА"],
    wordleTries: "3 / 6 попыток",
  },
  KZ: {
    history: "ТАРИХ", params: "ПАРАМЕТРЛЕР", done: "✓ ДАЙЫН",
    topics: ["Бөлшектер", "Периметр", "Аудан", "Бұрыштар", "Векторлар", "Функциялар"],
    grade: "5 сынып", gradeShort: "5 сн", classroom: "5А сынып", duration: "45 мин",
    subject: "Математика", topic: "Бөлшектер және бүтіннің бөлігі", topicShort: "Бөлшектер",
    detailsPh: "Сабақ мәліметтері...", contextPh: "Мәтінмән...",
    createPlan: "ЖОСПАР ЖАСАУ", createTest: "ТЕСТ ЖАСАУ", create: "ЖАСАУ",
    planTitleLong: "## Сабақ жоспары — Бөлшектер", planTitle: "## Сабақ жоспары",
    planMeta: "Математика · 5 сынып · 45 минут",
    goalsTitle: "## Сабақ мақсаттары",
    goalsLong: ["- Бөлшек ұғымымен таныстыру", "- Бөлшекті жазу және оқу дағдысын қалыптастыру", "- Бөлшектерді салыстыруды үйрету"],
    goalsShort: ["- Бөлшек ұғымымен таныстыру", "- Есептеу дағдысын дамыту"],
    flowTitle: "## Сабақ барысы",
    flowLong: [["Ұйымдастыру кезеңі", "2 мин"], ["Білімді жаңғырту", "8 мин"], ["Жаңа материал", "15 мин"], ["Практикалық жұмыс", "15 мин"], ["Қорытынды", "5 мин"]],
    flowShort: [["Кіріспе", "5 мин"], ["Түсіндіру", "15 мин"], ["Практика", "20 мин"], ["Қорытынды", "5 мин"]],
    copy: "КӨШІРУ", exportDocx: "⬇ DOCX-КЕ ЖҮКТЕУ",
    code: "код", results: "📊 Нәтижелер",
    summaryTitle: "Сабақ қорытындысы — AI есеп",
    summaryHead: "📋 Математика · Бөлшектер · 5А",
    summaryCovered: ["Тақырып ", "82%", " меңгерілді · 14 оқушы"],
    needHelp: "⚠ Көмек керек",
    homework: "📝 Үй тапсырмасы",
    homeworkBody: "Есептер жинағы 45-бет, №3–7. Бөлшектерді салыстыру ережесін қайталау.",
    copyKundelik: "Кунделикке көшіру",
    wordleTitle: "ВОРДЛ — СЫНЫП", wordleAnswer: "САБАҚ", wordleGuesses: ["САНАУ", "САБЫН", "САБАҚ"],
    wordleTries: "3 / 6 әрекет",
  },
  EN: {
    history: "HISTORY", params: "PARAMETERS", done: "✓ DONE",
    topics: ["Fractions", "Perimeter", "Area", "Angles", "Vectors", "Functions"],
    grade: "Grade 5", gradeShort: "G5", classroom: "Grade 5A", duration: "45 min",
    subject: "Math", topic: "Fractions and parts of a whole", topicShort: "Fractions",
    detailsPh: "Lesson details...", contextPh: "Context...",
    createPlan: "CREATE PLAN", createTest: "CREATE QUIZ", create: "CREATE",
    planTitleLong: "## Lesson plan — Fractions and parts", planTitle: "## Lesson plan",
    planMeta: "Math · Grade 5 · 45 minutes",
    goalsTitle: "## Lesson goals",
    goalsLong: ["- Introduce the concept of a fraction", "- Build skill in writing and reading fractions", "- Develop the ability to compare fractions"],
    goalsShort: ["- Introduce the concept of a fraction", "- Develop calculation skills"],
    flowTitle: "## Lesson flow",
    flowLong: [["Opening routine", "2 min"], ["Recalling prior knowledge", "8 min"], ["New material", "15 min"], ["Practical work", "15 min"], ["Wrap-up", "5 min"]],
    flowShort: [["Intro", "5 min"], ["Explanation", "15 min"], ["Practice", "20 min"], ["Wrap-up", "5 min"]],
    copy: "COPY", exportDocx: "⬇ EXPORT TO DOCX",
    code: "code", results: "📊 Results",
    summaryTitle: "Lesson summary — AI Report",
    summaryHead: "📋 Math · Fractions · 5A",
    summaryCovered: ["Topic covered at ", "82%", " · 14 students"],
    needHelp: "⚠ Needs support",
    homework: "📝 Homework",
    homeworkBody: "Workbook p. 45, #3–7. Review the rule for comparing fractions.",
    copyKundelik: "Copy to Kundelik",
    wordleTitle: "WORDLE — CLASS", wordleAnswer: "LEARN", wordleGuesses: ["LATER", "LEANS", "LEARN"],
    wordleTries: "3 / 6 tries",
  },
};

// Имена учеников для превью результатов — латиница только в EN
const MOCK_STUDENTS = {
  RU: [["Айгерим К.", "9/10", "green"], ["Данияр М.", "6/10", "yellow"], ["Зарина Т.", "10/10", "green"], ["Ернар С.", "7/10", "green"]],
  KZ: [["Айгерим Қ.", "9/10", "green"], ["Данияр М.", "6/10", "yellow"], ["Зарина Т.", "10/10", "green"], ["Ернар С.", "7/10", "green"]],
  EN: [["Aigerim K.", "9/10", "green"], ["Daniyar M.", "6/10", "yellow"], ["Zarina T.", "10/10", "green"], ["Yernar S.", "7/10", "green"]],
};

const MOCK_STRUGGLING = {
  RU: ["Данияр М. — 60%", "Ернар С. — 55%", "Камила Б. — 50%"],
  KZ: ["Данияр М. — 60%", "Ернар С. — 55%", "Камила Б. — 50%"],
  EN: ["Daniyar M. — 60%", "Yernar S. — 55%", "Kamila B. — 50%"],
};

const mock = (lang) => MOCK[lang] || MOCK.RU;

// Раскраска догадок как в настоящем Вордле: сначала точные попадания, потом остальные
function scoreGuess(guess, answer) {
  const g = [...guess], a = [...answer];
  const result = g.map(() => "a");
  const pool = {};
  g.forEach((ch, i) => {
    if (ch === a[i]) result[i] = "c";
    else pool[a[i]] = (pool[a[i]] || 0) + 1;
  });
  g.forEach((ch, i) => {
    if (result[i] === "c") return;
    if (pool[ch] > 0) { result[i] = "p"; pool[ch] -= 1; }
  });
  return g.map((l, i) => ({ l, s: result[i] }));
}

// ─── Browser shell ─────────────────────────────────────────────────────────────
function BrowserShell({ children, url = "/", tall = false }) {
  return (
    <div className="rounded-2xl border-[3px] border-black dark:border-zinc-600 overflow-hidden shadow-[12px_12px_0_0_#000] dark:shadow-[12px_12px_0_0_rgba(255,255,255,0.06)]">
      <div className="bg-zinc-800 px-3 py-2.5 flex items-center gap-2 border-b-2 border-black/20">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <div className="flex-1 bg-zinc-700 rounded-full h-5 mx-3 flex items-center px-3">
          <span className="text-[9px] text-zinc-400 font-mono">{url}</span>
        </div>
      </div>
      <div className="bg-zinc-900 px-3 py-2 flex items-center justify-between border-b border-zinc-700/60">
        <span className="text-[8px] font-black text-white tracking-[0.18em]">LESSON PLANNER</span>
        <div className="flex gap-3">{['Hub','Tools','Games','Classes'].map(l=><span key={l} className="text-[7px] font-bold text-zinc-400">{l}</span>)}</div>
        <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[7px] text-white font-black">А</div>
      </div>
      <div style={{ height: tall ? 340 : 260 }}>{children}</div>
    </div>
  );
}

// ─── Dashboard preview (hero) ─────────────────────────────────────────────────
function DashboardPreview({ lang }) {
  const m = mock(lang);
  return (
    <BrowserShell url="/dashboard" tall>
      <div className="flex h-full bg-[#f0f4f8]">
        <div className="w-[80px] bg-white/60 border-r border-black/5 p-2 shrink-0 flex flex-col gap-1">
          <div className="text-[5px] font-black text-black/25 tracking-widest mb-2 px-1">{m.history}</div>
          {m.topics.map((t,i)=>(
            <div key={i} className={`text-[5.5px] font-bold px-1.5 py-1.5 rounded-md truncate ${i===0?'bg-emerald-600 text-white':'text-black/40'}`}>{t}</div>
          ))}
        </div>
        <div className="w-[140px] bg-white/70 border-r border-black/5 p-3 flex flex-col gap-2 shrink-0">
          <div className="text-[6px] font-black text-emerald-600 tracking-widest">PLANNER</div>
          <div className="flex gap-1">
            <div className="flex-1 bg-slate-100 rounded text-[5px] text-black/50 px-1.5 py-1 font-bold truncate">{m.grade}</div>
            <div className="flex-1 bg-slate-100 rounded text-[5px] text-black/50 px-1.5 py-1 font-bold truncate">{m.duration}</div>
          </div>
          <div className="bg-slate-100 rounded text-[5px] text-black/50 px-1.5 py-1.5 font-bold truncate">{m.subject}</div>
          <div className="bg-slate-100 rounded text-[5px] text-black/50 px-1.5 py-1.5 font-bold truncate">{m.topic}</div>
          <div className="bg-slate-100 rounded text-[5px] text-black/20 px-1.5 py-5">{m.detailsPh}</div>
          <div className="bg-emerald-600 rounded text-[5.5px] text-white font-black text-center py-2 mt-auto border border-black shadow-[2px_2px_0_0_#000]">{m.createPlan}</div>
        </div>
        <div className="flex-1 min-w-0 bg-white/90 p-3 flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-[7px] font-black italic text-black/70 truncate">{m.planTitleLong}</div>
            <div className="ml-auto text-[5px] bg-green-100 text-green-700 font-black px-2 py-0.5 rounded-full border border-green-200 shrink-0">{m.done}</div>
          </div>
          <div className="text-[5px] text-black/40 italic">{m.planMeta}</div>
          <div className="w-full h-px bg-black/8 my-1" />
          <div className="text-[6px] font-black italic text-black/60 mb-0.5">{m.goalsTitle}</div>
          {m.goalsLong.map((l,i)=>(
            <div key={i} className="text-[5px] text-black/40 italic">{l}</div>
          ))}
          <div className="w-full h-px bg-black/8 my-1" />
          <div className="text-[6px] font-black italic text-black/60 mb-0.5">{m.flowTitle}</div>
          {m.flowLong.map(([s,t],i)=>(
            <div key={i} className="flex justify-between gap-2 text-[5px] text-black/40 italic py-0.5 border-b border-black/4 last:border-0">
              <span className="truncate">{s}</span><span className="font-bold text-emerald-500 shrink-0">{t}</span>
            </div>
          ))}
          <div className="mt-auto pt-2 border-t border-black/8 flex gap-1.5">
            <div className="flex-1 bg-emerald-600 rounded text-[5.5px] text-white font-black text-center py-1.5 border border-black shadow-[2px_2px_0_0_#000]">⬇ DOCX</div>
            <div className="flex-1 bg-black/5 rounded text-[5.5px] text-black/40 font-black text-center py-1.5">{m.copy}</div>
          </div>
        </div>
      </div>
    </BrowserShell>
  );
}

// ─── Feature visuals ───────────────────────────────────────────────────────────
function PlanVisual({ lang }) {
  const m = mock(lang);
  return (
    <BrowserShell url="/dashboard">
      <div className="flex h-full bg-[#f0f4f8]">
        <div className="w-[90px] bg-white/60 border-r border-black/5 p-2 flex flex-col gap-1 shrink-0">
          <div className="text-[5px] font-black text-black/25 tracking-widest mb-2">{m.history}</div>
          {m.topics.slice(0,4).map((t,i)=>(
            <div key={i} className={`text-[5.5px] font-bold px-1.5 py-1 rounded-md truncate ${i===0?'bg-emerald-600 text-white':'text-black/35'}`}>{t}</div>
          ))}
        </div>
        <div className="flex-1 min-w-0 bg-white/90 p-3 flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-[7px] font-black italic text-black/70 truncate">{m.planTitle}</div>
            <div className="ml-auto text-[5px] bg-green-100 text-green-700 font-black px-2 py-0.5 rounded-full border border-green-200 shrink-0">{m.done}</div>
          </div>
          {[m.goalsTitle, ...m.goalsShort, '', m.flowTitle].map((l,i)=>(
            <div key={i} className={`text-[5px] italic ${l.startsWith('##')?'font-black text-black/60':l===''?'my-0.5':l.startsWith('-')?'text-black/40 ml-2':'text-black/40'}`}>{l}</div>
          ))}
          {m.flowShort.map(([s,t],i)=>(
            <div key={i} className="flex justify-between gap-2 text-[5px] text-black/40 italic py-0.5 border-b border-black/4 last:border-0">
              <span className="truncate">{s}</span><span className="font-bold text-emerald-500 shrink-0">{t}</span>
            </div>
          ))}
          <div className="mt-auto pt-1.5 border-t border-black/8">
            <div className="bg-emerald-600 rounded text-[5.5px] text-white font-black text-center py-1.5 border border-black shadow-[2px_2px_0_0_#000]">{m.exportDocx}</div>
          </div>
        </div>
      </div>
    </BrowserShell>
  );
}

function TestVisual({ lang }) {
  const m = mock(lang);
  const students = MOCK_STUDENTS[lang] || MOCK_STUDENTS.RU;
  return (
    <BrowserShell url="/create-test">
      <div className="flex h-full bg-[#faf7f2] gap-2 p-2">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="bg-white rounded-xl border-[1.5px] border-black shadow-[2px_2px_0_0_#000] p-2">
            <div className="flex gap-1 mb-1.5">
              <div className="flex-1 min-w-0 bg-slate-100 rounded text-[5px] text-black/50 px-1.5 py-1 font-bold truncate">{m.subject}</div>
              <div className="bg-slate-100 rounded text-[5px] text-black/50 px-1.5 py-1 font-bold shrink-0">{m.gradeShort}</div>
            </div>
            <div className="bg-slate-100 rounded text-[5px] text-black/50 px-1.5 py-1 font-bold mb-1.5 truncate">{m.topic}</div>
            <div className="bg-emerald-600 rounded text-[5px] text-white font-black text-center py-1.5 border border-black shadow-[1.5px_1.5px_0_0_#000]">{m.createTest}</div>
          </div>
          <div className="bg-white rounded-xl border-[1.5px] border-emerald-600 shadow-[2px_2px_0_0_#059669] p-2 flex-1 flex flex-col gap-1.5">
            <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-1.5">
              <div className="min-w-0">
                <div className="text-[6px] font-black text-emerald-600 truncate">{m.subject}</div>
                <div className="text-[5px] text-black/40 font-bold truncate">{m.topicShort}</div>
              </div>
              <div className="bg-black rounded-lg px-2 py-1 text-center shrink-0">
                <div className="text-[4px] text-white/50 uppercase tracking-wide">{m.code}</div>
                <div className="text-[11px] font-black font-mono text-yellow-400 tracking-[0.2em] leading-none">4279</div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden flex-1">
              <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100">
                <span className="text-[4.5px] font-black uppercase">{m.results}</span>
                <span className="text-[4px] bg-purple-600 text-white font-black px-1.5 py-0.5 rounded">AI Report</span>
              </div>
              {students.map(([n,s,c])=>(
                <div key={n} className="flex items-center justify-between px-2 py-0.5 border-b border-gray-50 last:border-0">
                  <span className="text-[5px] font-bold text-black/60 truncate">{n}</span>
                  <span className={`text-[4.5px] font-black text-white px-1.5 rounded shrink-0 ${c==='green'?'bg-green-500':'bg-yellow-500'}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-[52px] flex flex-col gap-1.5 shrink-0">
          <div className="text-[4.5px] font-black text-black/25 tracking-widest">{m.history}</div>
          {m.topics.slice(0,4).map((t,i)=>(
            <div key={t} className={`p-1.5 rounded-lg border-2 ${i===0?'bg-emerald-600 border-black text-white':'bg-white border-gray-100 text-black/50'}`}>
              <div className="text-[5px] font-black truncate">{t}</div>
              <div className="text-[4px] opacity-60">{['07/25','07/23','07/20','07/18'][i]}</div>
            </div>
          ))}
        </div>
      </div>
    </BrowserShell>
  );
}

function SummaryVisual({ lang }) {
  const m = mock(lang);
  const struggling = MOCK_STRUGGLING[lang] || MOCK_STRUGGLING.RU;
  const [coveredPre, coveredPct, coveredPost] = m.summaryCovered;
  return (
    <BrowserShell url="/lesson-summary">
      <div className="flex h-full bg-[#faf7f2] gap-2 p-2">
        <div className="flex-1 min-w-0 bg-white rounded-xl border-[1.5px] border-black shadow-[2px_2px_0_0_#000] p-3 flex flex-col gap-2">
          <div className="text-[6px] font-black text-emerald-600 uppercase tracking-wider truncate">{m.summaryTitle}</div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2">
            <div className="text-[5.5px] font-black text-emerald-700 mb-1 truncate">{m.summaryHead}</div>
            <div className="text-[5px] text-emerald-600 font-bold">{coveredPre}<span className="font-black">{coveredPct}</span>{coveredPost}</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-2">
            <div className="text-[5px] font-black text-red-500 uppercase mb-1">{m.needHelp}</div>
            {struggling.map((s,i)=>(
              <div key={i} className="text-[5px] text-red-400 font-bold">{s}</div>
            ))}
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex-1">
            <div className="text-[5px] font-black text-slate-500 uppercase mb-1">{m.homework}</div>
            <div className="text-[5px] text-slate-500 font-bold leading-relaxed">{m.homeworkBody}</div>
          </div>
          <div className="bg-emerald-600 rounded-lg text-[5.5px] text-white font-black text-center py-2 border border-black shadow-[2px_2px_0_0_#000]">{m.copyKundelik}</div>
        </div>
        <div className="w-[90px] bg-white rounded-xl border-[1.5px] border-black shadow-[2px_2px_0_0_#000] p-2 flex flex-col gap-1.5 shrink-0">
          <div className="text-[5px] font-black text-black/25 tracking-widest">{m.params}</div>
          <div className="bg-slate-100 rounded text-[5px] text-black/50 px-1.5 py-1.5 font-bold truncate">{m.subject}</div>
          <div className="bg-slate-100 rounded text-[5px] text-black/50 px-1.5 py-1.5 font-bold truncate">{m.classroom}</div>
          <div className="bg-slate-100 rounded text-[5px] text-black/50 px-1.5 py-1.5 font-bold truncate">{m.topics[0]}</div>
          <div className="bg-slate-100 rounded text-[5px] text-black/20 px-1.5 py-3">{m.contextPh}</div>
          <div className="bg-emerald-600 rounded text-[5px] text-white font-black text-center py-1.5 border border-black shadow-[1.5px_1.5px_0_0_#000] mt-auto">{m.create}</div>
        </div>
      </div>
    </BrowserShell>
  );
}

function WordleVisual({ lang }) {
  const m = mock(lang);
  const played = m.wordleGuesses.map(g => scoreGuess(g, m.wordleAnswer));
  const empty = Array(m.wordleAnswer.length).fill({ l: '', s: 'e' });
  const grid = [...played, empty, empty, empty];

  const bg = {c:'bg-green-500 border-green-600 text-white',p:'bg-yellow-400 border-yellow-500 text-black',a:'bg-slate-600 border-slate-700 text-white',e:'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-600 text-transparent'};
  return (
    <BrowserShell url="/wordle">
      <div className="flex h-full bg-[#faf7f2] flex-col items-center justify-center gap-2 py-3">
        <div className="text-[7px] font-black uppercase tracking-widest text-slate-500 mb-1">{m.wordleTitle}</div>
        <div className="flex flex-col gap-1.5">
          {grid.map((row,ri)=>(
            <div key={ri} className="flex gap-1.5">
              {row.map((cell,ci)=>(
                <div key={ci} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm border-2 ${bg[cell.s]}`}>{cell.l}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="text-[6px] text-slate-500 dark:text-slate-400 font-bold mt-1">{m.wordleTries}</div>
      </div>
    </BrowserShell>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-zinc-800 last:border-0">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between py-5 text-left gap-4 group">
        <span className="font-bold text-[15px] text-slate-800 dark:text-zinc-200 group-hover:text-emerald-600 transition-colors">{q}</span>
        <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
          {open ? <Minus size={12} className="text-emerald-500" /> : <Plus size={12} className="text-slate-500 dark:text-slate-400" />}
        </div>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="pb-5 text-slate-500 dark:text-zinc-400 leading-relaxed text-sm">
          {a}
        </motion.div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage({ lang, setLang, setIsAuthOpen, setAuthMode, resetAuthFields, user, setUser }) {
  const c = COPY[lang] || COPY.RU;
  const navigate = useNavigate();
  const handleCta = () => {
    if (user) { navigate("/hub"); return; }
    resetAuthFields?.(); setAuthMode?.("signup"); setIsAuthOpen(true);
  };

  const headlines = HEADLINES[lang] || HEADLINES.RU;
  const [hlIdx, setHlIdx] = useState(0);
  // Индекс берём по модулю — при смене языка сбрасывать состояние не нужно
  const headline = headlines[hlIdx % headlines.length];
  useEffect(() => {
    const t = setInterval(() => setHlIdx(i => (i + 1) % headlines.length), 3500);
    return () => clearInterval(t);
  }, [headlines.length]);

  // FAQPage structured data — the FAQ section below already shows this exact
  // Q&A, so this just makes it eligible for a rich snippet. Injected/removed
  // on mount/unmount rather than living in index.html: Google's guidelines
  // require the markup to match content actually visible on the page, and
  // that's only true here on "/".
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, [c.faq]);

  const features = [
    { tag: c.f1tag, h: c.f1h, p: c.f1p, b: c.f1b, icon: BookOpen, color: "blue", Visual: PlanVisual },
    { tag: c.f2tag, h: c.f2h, p: c.f2p, b: c.f2b, icon: FileQuestion, color: "purple", Visual: TestVisual },
    { tag: c.f3tag, h: c.f3h, p: c.f3p, b: c.f3b, icon: ClipboardList, color: "emerald", Visual: SummaryVisual },
    { tag: c.f4tag, h: c.f4h, p: c.f4p, b: c.f4b, icon: Gamepad2, color: "orange", Visual: WordleVisual },
  ];

  const colMap = {
    blue:    { icon: "bg-emerald-600",  tag: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900", check: "bg-emerald-600" },
    purple:  { icon: "bg-purple-600",  tag: "text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900", check: "bg-purple-600" },
    emerald: { icon: "bg-emerald-600", tag: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900", check: "bg-emerald-600" },
    orange:  { icon: "bg-orange-500",  tag: "text-orange-500 bg-orange-50 dark:bg-orange-950/50 border-orange-100 dark:border-orange-900",  check: "bg-orange-500" },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans overflow-x-hidden pt-[148px]">

      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="fixed top-0 left-0 right-0 z-[200] bg-emerald-600 text-white flex items-center justify-center gap-3 py-2.5 text-[11px] font-black tracking-widest uppercase">
        <span className="hidden sm:inline opacity-90">
          {lang === "KZ" ? "Барлық Қазақстан мұғалімдері үшін тегін" : lang === "EN" ? "Currently free for all teachers in Kazakhstan" : "Сейчас бесплатно для всех учителей Казахстана"}
        </span>
        <button onClick={handleCta} className="underline hover:no-underline whitespace-nowrap">
          {c.cta} →
        </button>
      </div>

      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} isLanding announcementBar
        setIsAuthOpen={setIsAuthOpen} setAuthMode={setAuthMode} resetAuthFields={resetAuthFields} />

      {/* ── HERO ── */}
      <section id="main-content" className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-6 text-center">
        <motion.div {...fadeUp(0)}>
          <div className="inline-block px-4 py-1.5 mb-6 sm:mb-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase border border-emerald-100 dark:border-emerald-900">
            {c.badge}
          </div>
        </motion.div>
        <div className="min-h-[120px] sm:min-h-[150px] md:min-h-[180px] lg:min-h-[210px] flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.h1
              key={hlIdx}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.38, ease: "easeInOut" }}
              className="text-[34px] sm:text-5xl md:text-7xl lg:text-[82px] font-black uppercase tracking-tighter leading-[0.95] break-words"
            >
              {headline.a}<br />{headline.b}
            </motion.h1>
          </AnimatePresence>
        </div>
        <motion.p {...fadeUp(0.13)} className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-zinc-400 max-w-lg mx-auto mb-8 sm:mb-10 leading-relaxed">
          {c.sub}
        </motion.p>
        <motion.div {...fadeUp(0.18)}>
          <button onClick={handleCta}
            className="inline-flex items-center gap-3 px-7 sm:px-9 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl border-[3px] border-black shadow-[5px_5px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-[13px] sm:text-sm">
            {c.cta}
          </button>
        </motion.div>
      </section>


      {/* ── BEFORE / AFTER ── */}
      <motion.div {...fadeUp(0)} className="max-w-4xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 rounded-2xl border-[3px] border-black overflow-hidden shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.07)]">
          <div className="p-6 sm:p-8 bg-slate-100 dark:bg-zinc-900 border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-black">
            <div className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400 mb-5">
              {lang === "KZ" ? "Бұрын" : lang === "EN" ? "Before" : "Раньше"}
            </div>
            {(lang === "KZ"
              ? ["Сабақ жоспары — 2 сағат қолмен", "Тест — қағазда, баяу және қымбат", "Қорытынды — тағы да қолмен", "Оқушылар жалықтырады"]
              : lang === "EN"
              ? ["2 hours writing a lesson plan by hand", "Quizzes on paper — slow and expensive", "Lesson summary — written by hand again", "Students disengaged"]
              : ["2 часа на план урока вручную", "Тест на бумаге — долго и дорого", "Итог урока — снова вручную", "Ученики скучают"]
            ).map((item, i) => (
              <div key={i} className="flex items-start gap-3 mb-3 text-sm text-slate-500 dark:text-zinc-400">
                <span className="text-red-400 font-black shrink-0 mt-0.5">✗</span> {item}
              </div>
            ))}
          </div>
          <div className="p-6 sm:p-8 bg-white dark:bg-zinc-800">
            <div className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-600 mb-5">
              {lang === "KZ" ? "Қазір" : lang === "EN" ? "Now" : "Теперь"}
            </div>
            {(lang === "KZ"
              ? ["60 секунд — жоспар DOCX-те дайын", "AI тест — минутта, кодпен кіру", "AI қорытынды жазады — бір батырмамен", "Вордл мен тесттер тікелей сабақта"]
              : lang === "EN"
              ? ["60 seconds — plan ready, exported to DOCX", "AI quiz with access code in one minute", "AI writes the summary in one click", "Wordle and quizzes live in the lesson"]
              : ["60 секунд — план готов в DOCX", "AI-тест с кодом доступа за минуту", "AI пишет итог одной кнопкой", "Вордл и тесты прямо на уроке"]
            ).map((item, i) => (
              <div key={i} className="flex items-start gap-3 mb-3 text-sm font-medium text-slate-800 dark:text-zinc-200">
                <span className="text-emerald-500 font-black shrink-0 mt-0.5">✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── FEATURES ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24 space-y-20 sm:space-y-28">
        {features.map((f, i) => {
          const Icon = f.icon;
          const col = colMap[f.color];
          const flip = i % 2 !== 0;
          return (
            <motion.div key={i} {...fadeUp(0.05)}
              className={`flex flex-col ${flip ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center`}>
              {/* Text */}
              <div className="w-full min-w-0">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-black tracking-widest uppercase mb-5 ${col.tag}`}>
                  <Icon size={12} />
                  {f.tag}
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 leading-tight">{f.h}</h3>
                <p className="text-slate-500 dark:text-zinc-400 leading-relaxed mb-6 text-[15px]">{f.p}</p>
                <ul className="space-y-2">
                  {f.b.map((b, bi) => (
                    <li key={bi} className="flex items-center gap-2.5 text-sm font-medium">
                      <span className={`w-4 h-4 ${col.check} rounded-full flex items-center justify-center shrink-0 border-2 border-black`}>
                        <Check size={9} color="white" strokeWidth={3} />
                      </span>
                      <span className="text-slate-700 dark:text-zinc-300">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Visual */}
              <div className="w-full min-w-0">
                <f.Visual lang={lang} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── STUDENT JOIN FLOW ── */}
      <section className="border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <motion.div {...fadeUp(0)} className="mb-12 text-center">
            <div className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-600 mb-3">
              {lang === "KZ" ? "ОҚУШЫЛАР ҮШІН" : lang === "EN" ? "FOR STUDENTS" : "ДЛЯ УЧЕНИКОВ"}
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              {lang === "KZ" ? "Тіркелусіз. Кез келген телефоннан." : lang === "EN" ? "No account. Any phone. 10 seconds." : "Без регистрации. С любого телефона."}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm max-w-md mx-auto">
              {lang === "KZ" ? "Оқушылар ештеңе орнатпайды — тек 4 санды код енгізеді." : lang === "EN" ? "Students install nothing — they just type the 4-digit code." : "Ученикам ничего устанавливать не нужно — просто вводят 4-значный код."}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
            {(lang === "KZ"
              ? [["1", "Кодты теріңіз", "Мұғалім 4 санды кодты тақтаға жазады"], ["2", "Атыңызды енгізіңіз", "Тіркелу жоқ, пароль жоқ — тек атыңыз"], ["3", "Жауап беріңіз", "Нәтижелер мұғалімде нақты уақытта"]]
              : lang === "EN"
              ? [["1", "Enter the code", "Teacher writes the 4-digit code on the board"], ["2", "Type your name", "No signup, no password — just your name"], ["3", "Answer live", "Results appear for the teacher in real time"]]
              : [["1", "Введи код", "Учитель пишет 4-значный код на доске"], ["2", "Введи имя", "Никакой регистрации — только имя"], ["3", "Отвечай", "Результаты у учителя в реальном времени"]]
            ).map(([n, title, desc], i, arr) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="relative">
                {i < arr.length - 1 && (
                  <div className="hidden md:block absolute right-[-20px] top-8 text-slate-200 dark:text-zinc-700 font-black text-2xl z-10">→</div>
                )}
                <div className="text-center p-7 rounded-2xl bg-[#f8fafc] dark:bg-zinc-800 border-[2px] border-black shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.06)]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 border-2 border-black flex items-center justify-center font-black text-white text-base mx-auto mb-4">{n}</div>
                  <div className="font-black text-sm uppercase tracking-tight mb-2">{title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#020617] text-white border-y-[4px] border-black">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <motion.div {...fadeUp(0)} className="mb-14">
            <div className="text-[10px] font-black tracking-[0.3em] text-emerald-400 uppercase mb-4">
              {lang === "KZ" ? "ҚАЛАЙ ЖҰМЫС ІСТЕЙДІ" : lang === "EN" ? "HOW IT WORKS" : "КАК ЭТО РАБОТАЕТ"}
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{c.how}</h2>
          </motion.div>
          <div className="space-y-0">
            {[[c.s1t, c.s1d, "01"], [c.s2t, c.s2d, "02"], [c.s3t, c.s3d, "03"]].map(([title, desc, n], i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="flex items-start gap-8 py-10 border-b border-white/10 last:border-0">
                <span className="text-[56px] font-black leading-none text-white/15 shrink-0 w-20 text-right">{n}</span>
                <div className="pt-2">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-white">{title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ТАРИФЫ ── перед FAQ: человек уже увидел, что умеет продукт,
           и логично спросить «а сколько это стоит» до частых вопросов */}
      <section className="border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <motion.div {...fadeUp(0)}>
            <PlansComparison lang={lang} user={user} onStart={handleCta} />
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-slate-100 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
          <motion.div {...fadeUp(0)} className="mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{c.faqT}</h2>
          </motion.div>
          <motion.div {...fadeUp(0.05)}>
            {c.faq.map((item, i) => <FaqItem key={i} {...item} />)}
          </motion.div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
