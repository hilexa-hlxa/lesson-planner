import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen, FileQuestion, ClipboardList, Gamepad2, Plus, Minus } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { I18N as t } from "../lib/i18n";

// ─── animation helpers ───────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, delay },
});

// ─── copy ─────────────────────────────────────────────────────────────────────
const COPY = {
  RU: {
    badge: "AI-ПЛАТФОРМА ДЛЯ УЧИТЕЛЕЙ",
    hero: "Планируйте уроки эффективно",
    sub: "Генерация планов уроков, тесты в реальном времени и автоматические отчёты — всё в одном месте.",
    cta: "Начать бесплатно",
    ctaSub: "Регистрация за 30 секунд",

    mockupTitle: "Интерфейс платформы",
    mockupSub: "Просто, понятно, быстро.",
    mockup1Label: "Генератор планов урока",
    mockup2Label: "AI Тесты — живая сессия",

    featuresTitle: "Всё что нужно учителю",
    featuresSub: "Меньше рутины — больше времени на преподавание.",
    features: [
      { icon: BookOpen, color: "bg-blue-600", shadow: "shadow-[6px_6px_0_0_rgba(37,99,235,0.4)]", title: "Планы уроков", desc: "ИИ генерирует полный план с целями, ходом, дифференциацией и ДЗ за 60 секунд. Экспорт в DOCX одной кнопкой." },
      { icon: FileQuestion, color: "bg-purple-600", shadow: "shadow-[6px_6px_0_0_rgba(147,51,234,0.4)]", title: "AI Тесты", desc: "Создайте тест по теме и запустите живую сессию. Ученики заходят по 4-значному коду — результаты приходят сразу." },
      { icon: ClipboardList, color: "bg-green-600", shadow: "shadow-[6px_6px_0_0_rgba(22,163,74,0.4)]", title: "Итог урока", desc: "После теста ИИ пишет отчёт: что прошли, домашнее задание, кому нужна помощь. Копируй и вставляй в Кунделик." },
      { icon: Gamepad2, color: "bg-orange-500", shadow: "shadow-[6px_6px_0_0_rgba(249,115,22,0.4)]", title: "Игры для класса", desc: "Интерактивные игры прямо на уроке. Вордл, викторины и другие форматы — ученики играют со своих устройств." },
    ],

    howTitle: "Как это работает",
    howSub: "Три шага — и урок готов.",
    steps: [
      { n: "01", title: "Создайте аккаунт", desc: "Регистрация учителя занимает 30 секунд. Никаких карт, никаких подписок." },
      { n: "02", title: "Генерируйте контент", desc: "Введите предмет и тему — ИИ создаёт план урока или тест за минуту." },
      { n: "03", title: "Ведите урок", desc: "Запустите тест, следите за результатами в реальном времени, получите итог." },
    ],

    pitchTitle: "Учителя тратят часы на бумажную работу.",
    pitchSub: "Мы берём это на себя.",
    pitchDesc: "Ежедневные отчёты, планы уроков, тесты и обратная связь — всё это отнимает время, которое лучше потратить на учеников. Lesson Planner автоматизирует рутину, оставляя вам главное.",

    stats: [
      { value: "60с", label: "на план урока" },
      { value: "3", label: "языка: RU, KZ, EN" },
      { value: "100%", label: "бесплатно сейчас" },
    ],

    faqTitle: "Частые вопросы",
    faq: [
      { q: "Это бесплатно?", a: "Да, платформа полностью бесплатна на данный момент. Регистрируйся и используй всё без ограничений." },
      { q: "Нужно что-то устанавливать?", a: "Нет. Всё работает в браузере — на компьютере, планшете или телефоне." },
      { q: "На каком языке работает?", a: "Интерфейс и генерация поддерживают русский, казахский и английский языки. Переключается в один клик." },
      { q: "Могут ли студенты использовать платформу?", a: "Да. Ученики регистрируются отдельно, вступают в класс по коду и проходят тесты. Их история сохраняется." },
      { q: "Безопасны ли данные?", a: "Данные хранятся в защищённой облачной базе данных. Ничего не передаётся третьим лицам." },
    ],

    bottomCta: "Начать прямо сейчас",
    bottomCtaSub: "Бесплатно. Без карты.",
    statsTitle: "Создано для казахстанских школ",
  },

  KZ: {
    badge: "МҰҒАЛІМДЕРГЕ АРНАЛҒАН AI-ПЛАТФОРМА",
    hero: "Сабақты тиімді жоспарлаңыз",
    sub: "Сабақ жоспарларын жасау, нақты уақыттағы тесттер және автоматты есептер — барлығы бір жерде.",
    cta: "Тегін бастау",
    ctaSub: "30 секундта тіркелу",

    mockupTitle: "Платформа интерфейсі",
    mockupSub: "Қарапайым, түсінікті, жылдам.",
    mockup1Label: "Сабақ жоспарын генератор",
    mockup2Label: "AI Тесттер — тікелей сессия",

    featuresTitle: "Мұғалімге қажетті барлығы",
    featuresSub: "Аз күш — оқытуға көп уақыт.",
    features: [
      { icon: BookOpen, color: "bg-blue-600", shadow: "shadow-[6px_6px_0_0_rgba(37,99,235,0.4)]", title: "Сабақ жоспарлары", desc: "ЖИ 60 секундта мақсаттары, барысы және үй тапсырмасы бар толық сабақ жоспарын жасайды. DOCX-ке бір батырмамен." },
      { icon: FileQuestion, color: "bg-purple-600", shadow: "shadow-[6px_6px_0_0_rgba(147,51,234,0.4)]", title: "AI Тесттер", desc: "Тақырып бойынша тест жасаңыз және тікелей сессия іске қосыңыз. Оқушылар 4 санды кодпен кіреді." },
      { icon: ClipboardList, color: "bg-green-600", shadow: "shadow-[6px_6px_0_0_rgba(22,163,74,0.4)]", title: "Сабақ қорытындысы", desc: "Тесттен кейін ЖИ есеп жазады: нені өттік, үй тапсырмасы, кімге көмек қажет. Кунделикке көшіру." },
      { icon: Gamepad2, color: "bg-orange-500", shadow: "shadow-[6px_6px_0_0_rgba(249,115,22,0.4)]", title: "Сынып ойындары", desc: "Сабақта интерактивті ойындар. Вордл, викториналар — оқушылар өз құрылғыларынан нақты уақытта ойнайды." },
    ],

    howTitle: "Қалай жұмыс істейді",
    howSub: "Үш қадам — сабақ дайын.",
    steps: [
      { n: "01", title: "Аккаунт жасаңыз", desc: "Мұғалімді тіркеу 30 секунд алады. Карта жоқ, жазылым жоқ." },
      { n: "02", title: "Контент жасаңыз", desc: "Пән мен тақырыпты енгізіңіз — ЖИ бір минутта сабақ жоспарын немесе тестті жасайды." },
      { n: "03", title: "Сабақ өткізіңіз", desc: "Тестті іске қосыңыз, нәтижелерді нақты уақытта бақылаңыз, қорытынды алыңыз." },
    ],

    pitchTitle: "Мұғалімдер қағаз жұмысына сағаттарын жұмсайды.",
    pitchSub: "Біз мұны өз мойнымызға аламыз.",
    pitchDesc: "Күнделікті есептер, сабақ жоспарлары, тесттер — барлығы оқушыларға жақсы берілуі мүмкін уақытты алып кетеді. Lesson Planner рутинді автоматтандырады.",

    stats: [
      { value: "60с", label: "сабақ жоспарына" },
      { value: "3", label: "тіл: RU, KZ, EN" },
      { value: "100%", label: "қазір тегін" },
    ],

    faqTitle: "Жиі қойылатын сұрақтар",
    faq: [
      { q: "Бұл тегін бе?", a: "Иә, платформа қазір толығымен тегін. Тіркеліп, барлығын шектеусіз пайдаланыңыз." },
      { q: "Бірдеңе орнату керек пе?", a: "Жоқ. Барлығы браузерде жұмыс істейді — компьютерде, планшетте немесе телефонда." },
      { q: "Қандай тілде жұмыс істейді?", a: "Интерфейс және генерация орыс, қазақ және ағылшын тілдерін қолдайды." },
      { q: "Оқушылар платформаны пайдалана ала ма?", a: "Иә. Оқушылар жеке тіркеліп, кодпен сыныпқа кіреді және тесттер тапсырады." },
      { q: "Деректер қауіпсіз бе?", a: "Деректер қорғалған бұлтты дерекқорда сақталады. Үшінші тараптарға берілмейді." },
    ],

    bottomCta: "Қазір бастау",
    bottomCtaSub: "Тегін. Картасыз.",
    statsTitle: "Қазақстан мектептері үшін жасалған",
  },

  EN: {
    badge: "AI PLATFORM FOR TEACHERS",
    hero: "Plan Lessons Effectively",
    sub: "AI lesson plans, live quiz sessions and automated daily reports — all in one place.",
    cta: "Get Started Free",
    ctaSub: "Sign up in 30 seconds",

    mockupTitle: "Platform interface",
    mockupSub: "Simple, clear, fast.",
    mockup1Label: "Lesson Plan Generator",
    mockup2Label: "AI Tests — live session",

    featuresTitle: "Everything a teacher needs",
    featuresSub: "Less paperwork. More teaching.",
    features: [
      { icon: BookOpen, color: "bg-blue-600", shadow: "shadow-[6px_6px_0_0_rgba(37,99,235,0.4)]", title: "Lesson Plans", desc: "AI generates a full lesson plan with goals, timeline, differentiation and homework in 60 seconds. One-click DOCX export." },
      { icon: FileQuestion, color: "bg-purple-600", shadow: "shadow-[6px_6px_0_0_rgba(147,51,234,0.4)]", title: "AI Tests", desc: "Create a quiz by topic and launch a live session. Students join with a 4-digit code — results come in instantly." },
      { icon: ClipboardList, color: "bg-green-600", shadow: "shadow-[6px_6px_0_0_rgba(22,163,74,0.4)]", title: "Lesson Summary", desc: "After the test, AI writes the report: what was covered, homework, who needs support. Copy and paste into Kundelik." },
      { icon: Gamepad2, color: "bg-orange-500", shadow: "shadow-[6px_6px_0_0_rgba(249,115,22,0.4)]", title: "Classroom Games", desc: "Interactive games right in the lesson. Wordle, quizzes and more — students play from their own devices in real time." },
    ],

    howTitle: "How it works",
    howSub: "Three steps and your lesson is ready.",
    steps: [
      { n: "01", title: "Create an account", desc: "Teacher registration takes 30 seconds. No card, no subscription." },
      { n: "02", title: "Generate content", desc: "Enter subject and topic — AI creates a lesson plan or test in one minute." },
      { n: "03", title: "Teach your class", desc: "Launch the test, watch results in real time, get the lesson summary." },
    ],

    pitchTitle: "Teachers spend hours on paperwork.",
    pitchSub: "We take that off your plate.",
    pitchDesc: "Daily records, lesson plans, tests and feedback all eat into time that could be spent on students. Lesson Planner automates the routine so you can focus on what matters.",

    stats: [
      { value: "60s", label: "to a lesson plan" },
      { value: "3", label: "languages: RU, KZ, EN" },
      { value: "100%", label: "free right now" },
    ],

    faqTitle: "Frequently Asked Questions",
    faq: [
      { q: "Is it free?", a: "Yes, the platform is completely free right now. Sign up and use everything without limits." },
      { q: "Do I need to install anything?", a: "No. Everything runs in the browser — on desktop, tablet or phone." },
      { q: "What languages does it support?", a: "The interface and AI generation support Russian, Kazakh and English. Switch in one click." },
      { q: "Can students use the platform?", a: "Yes. Students register separately, join a class with a code, and take tests. Their history is saved." },
      { q: "Is the data safe?", a: "Data is stored in a secure cloud database. Nothing is shared with third parties." },
    ],

    bottomCta: "Start right now",
    bottomCtaSub: "Free. No card required.",
    statsTitle: "Built for Kazakhstani schools",
  },
};

// ─── Desktop mockup components ───────────────────────────────────────────────

function MonitorFrame({ label, children }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full rounded-t-2xl border-[5px] border-black dark:border-zinc-600 overflow-hidden shadow-[10px_10px_0_0_#000] dark:shadow-[10px_10px_0_0_rgba(255,255,255,0.1)]">
        {/* Browser chrome */}
        <div className="bg-zinc-800 px-3 py-2 flex items-center gap-2 border-b-2 border-black/30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <div className="flex-1 bg-zinc-700 rounded-full h-4 mx-3 flex items-center px-2">
            <span className="text-[7px] text-zinc-400 font-mono">lessonplanner.kz</span>
          </div>
        </div>
        {/* App header bar */}
        <div className="bg-zinc-900 px-3 py-1.5 flex items-center justify-between border-b border-zinc-700">
          <span className="text-[7px] font-black text-white tracking-widest">LESSON PLANNER</span>
          <div className="flex gap-2">
            {['Hub','Tools','Games'].map(l => (
              <span key={l} className="text-[6px] font-bold text-zinc-400">{l}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[6px] font-black text-zinc-400 border border-zinc-600 px-1 rounded">RU</span>
            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[6px] text-white font-black">А</div>
          </div>
        </div>
        {/* Content */}
        <div className="bg-zinc-950" style={{ height: 240 }}>
          {children}
        </div>
      </div>
      {/* Stand */}
      <div className="w-16 h-3 bg-zinc-700 dark:bg-zinc-600" />
      <div className="w-28 h-2 bg-zinc-800 dark:bg-zinc-700 rounded-full" />
      <p className="mt-3 text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}

function LessonPlanMockup() {
  return (
    <div className="flex h-full gap-1 p-1.5 text-white">
      {/* Sidebar */}
      <div className="w-16 bg-white/5 rounded-xl p-1.5 flex flex-col gap-1 shrink-0">
        <div className="text-[5px] font-black text-white/30 tracking-widest mb-1">ИСТОРИЯ</div>
        {['Дроби', 'Периметр', 'Площадь', 'Углы', 'Тригон.'].map((item, i) => (
          <div key={i} className={`text-[6px] font-bold px-1.5 py-1 rounded-lg ${i === 0 ? 'bg-blue-600' : 'text-white/40 hover:bg-white/5'}`}>{item}</div>
        ))}
      </div>
      {/* Form */}
      <div className="w-[88px] bg-white/5 rounded-xl p-1.5 flex flex-col gap-1 shrink-0">
        <div className="text-[5px] font-black text-blue-400 tracking-widest mb-0.5">PLANNER</div>
        <div className="flex gap-1">
          <div className="flex-1 bg-white/10 rounded text-[5px] text-white/50 px-1 py-0.5 text-center">5 Кл</div>
          <div className="flex-1 bg-white/10 rounded text-[5px] text-white/50 px-1 py-0.5 text-center">45 Мин</div>
        </div>
        <div className="bg-white/10 rounded text-[5px] text-white/50 px-1 py-1">Математика</div>
        <div className="bg-white/10 rounded text-[5px] text-white/50 px-1 py-1">Дроби и части</div>
        <div className="bg-white/10 rounded text-[5px] text-white/30 px-1 py-3">Детали урока...</div>
        <div className="bg-blue-600 rounded-lg text-[5px] text-white font-black text-center py-1.5 mt-auto border border-black/30">СОЗДАТЬ ПЛАН</div>
      </div>
      {/* Output */}
      <div className="flex-1 bg-white/5 rounded-xl p-1.5 overflow-hidden flex flex-col gap-0.5 min-w-0">
        <div className="text-[6px] font-black text-white/80 mb-0.5">## План урока</div>
        <div className="text-[5px] text-white/50"><span className="text-white/30">**Предмет:**</span> Математика</div>
        <div className="text-[5px] text-white/50"><span className="text-white/30">**Тема:**</span> Дроби и части</div>
        <div className="w-full h-px bg-white/10 my-0.5" />
        <div className="text-[5.5px] font-black text-white/70">## Цели урока</div>
        {['- Познакомить учеников с понятием дроби', '- Развить навыки вычислений', '- Применить знания на практике'].map((l, i) => (
          <div key={i} className="text-[4.5px] text-white/40 leading-relaxed">{l}</div>
        ))}
        <div className="w-full h-px bg-white/10 my-0.5" />
        <div className="text-[5.5px] font-black text-white/70">## Ход урока</div>
        <div className="bg-white/5 rounded p-1">
          {[['Введение', '5 мин', 'bg-blue-500/20'], ['Объяснение', '15 мин', 'bg-purple-500/20'], ['Практика', '20 мин', 'bg-green-500/20'], ['Итог', '5 мин', 'bg-orange-500/20']].map(([s, ti, cl], i) => (
            <div key={i} className={`flex justify-between text-[4.5px] text-white/50 py-0.5 px-1 rounded mb-0.5 ${cl}`}>
              <span>{s}</span><span className="text-white/30">{ti}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestMockup() {
  return (
    <div className="flex h-full gap-1 p-1.5 text-white">
      {/* Form + session */}
      <div className="w-24 bg-white/5 rounded-xl p-1.5 flex flex-col gap-1 shrink-0">
        <div className="text-[5px] font-black text-purple-400 tracking-widest mb-0.5">AI TESTS</div>
        <div className="bg-white/10 rounded text-[5px] text-white/50 px-1 py-1">Математика</div>
        <div className="bg-white/10 rounded text-[5px] text-white/50 px-1 py-1">Дроби и части</div>
        <div className="flex gap-1">
          <div className="flex-1 bg-white/10 rounded text-[5px] text-white/40 px-1 py-0.5 text-center">5 кл</div>
          <div className="flex-1 bg-white/10 rounded text-[5px] text-white/40 px-1 py-0.5 text-center">10 вопр</div>
        </div>
        <div className="bg-purple-600 rounded-lg text-[5px] text-white font-black text-center py-1.5 border border-black/30">СОЗДАТЬ ТЕСТ</div>
        {/* Live session */}
        <div className="mt-1 border border-yellow-400/40 rounded-lg p-1.5 bg-yellow-400/5">
          <div className="text-[5px] text-yellow-400 font-black mb-1">◉ ЖИВАЯ СЕССИЯ</div>
          <div className="text-[10px] font-mono font-black text-white tracking-[0.25em] text-center mb-1">4 2 7 9</div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[5px] text-white/50">6 онлайн</span>
          </div>
        </div>
      </div>
      {/* Test questions */}
      <div className="flex-1 bg-white/5 rounded-xl p-1.5 flex flex-col gap-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[5.5px] font-black text-white/70">Вопрос 2 / 10</span>
          <div className="flex gap-0.5">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-sm ${i < 2 ? 'bg-blue-500' : 'bg-white/15'}`} />
            ))}
          </div>
        </div>
        <div className="text-[5.5px] text-white/80 font-bold mb-1 leading-relaxed">Что называется правильной дробью?</div>
        {[
          { t: 'A. Числитель меньше знаменателя', c: true },
          { t: 'B. Числитель больше знаменателя', c: false },
          { t: 'C. Числитель равен знаменателю', c: false },
          { t: 'D. Знаменатель равен нулю', c: false },
        ].map((o, i) => (
          <div key={i} className={`text-[5px] px-1.5 py-1 rounded-lg border transition-all ${o.c ? 'border-green-500/60 bg-green-500/15 text-green-300' : 'border-white/10 text-white/40'}`}>
            {o.t}
          </div>
        ))}
        <div className="mt-auto pt-1 border-t border-white/10">
          <div className="text-[4.5px] text-white/30 font-bold uppercase tracking-widest">Результаты</div>
          {[['Айгерим К.', 85, true], ['Данияр М.', 60, false], ['Зарина Т.', 100, true]].map(([n, sc, ok]) => (
            <div key={n} className="flex items-center justify-between py-0.5">
              <span className="text-[4.5px] text-white/50">{n}</span>
              <span className={`text-[5px] font-black ${ok ? 'text-green-400' : 'text-yellow-400'}`}>{sc}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* History */}
      <div className="w-14 bg-white/5 rounded-xl p-1.5 shrink-0">
        <div className="text-[5px] font-black text-white/30 tracking-widest mb-1">ИСТОРИЯ</div>
        {[['Дроби', '95%'], ['Периметр', '78%'], ['Площадь', '82%'], ['Углы', '71%']].map(([topic, sc]) => (
          <div key={topic} className="py-1 border-b border-white/5">
            <div className="text-[5px] text-white/50 font-bold">{topic}</div>
            <div className="text-[4.5px] text-white/25">avg {sc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b-2 border-black/10 dark:border-white/10 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-black text-base">{q}</span>
        {open ? <Minus size={18} className="shrink-0 text-blue-600" /> : <Plus size={18} className="shrink-0 text-slate-400" />}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-5 text-slate-500 dark:text-zinc-400 font-bold leading-relaxed"
        >
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
    resetAuthFields?.();
    setAuthMode?.("signup");
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans overflow-x-hidden pt-[100px]">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} isLanding={true}
        setIsAuthOpen={setIsAuthOpen} setAuthMode={setAuthMode} resetAuthFields={resetAuthFields} />

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-8 py-28 text-center">
        <motion.div {...fadeUp(0)}>
          <div className="inline-block px-5 py-2 mb-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-black tracking-[0.2em] uppercase border border-blue-100 dark:border-blue-800">
            ✨ {c.badge}
          </div>
        </motion.div>
        <motion.h1 {...fadeUp(0.1)} className="text-7xl md:text-8xl font-black uppercase tracking-tighter mb-10 leading-[1.02]">
          {c.hero}
        </motion.h1>
        <motion.p {...fadeUp(0.2)} className="text-xl md:text-2xl opacity-50 max-w-2xl mx-auto mb-14 font-medium leading-relaxed">
          {c.sub}
        </motion.p>
        <motion.div {...fadeUp(0.3)}>
          <button onClick={handleCta}
            className="group inline-flex items-center gap-5 px-14 py-7 bg-blue-600 text-white text-xl font-black uppercase tracking-widest rounded-[32px] border-[4px] border-black shadow-[10px_10px_0px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
            {c.cta} <ChevronRight size={26} strokeWidth={3} />
          </button>
          <p className="mt-5 text-sm text-slate-400 font-bold">{c.ctaSub}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {c.stats.map((s, i) => (
              <span key={i} className="text-sm font-bold text-slate-400">
                <span className="text-blue-500 mr-1">✓</span>{s.value} — {s.label}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── PITCH ── */}
      <section className="max-w-6xl mx-auto px-8 py-28">
        <motion.div {...fadeUp(0)}
          className="p-12 md:p-20 bg-blue-600 text-white rounded-[40px] border-[4px] border-black shadow-[12px_12px_0_0_#000]">
          <div className="max-w-3xl">
            <p className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-4">{c.pitchTitle}</p>
            <p className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-10 opacity-70">{c.pitchSub}</p>
            <p className="text-lg font-bold leading-relaxed opacity-80 max-w-xl">{c.pitchDesc}</p>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-8 pb-28">
        <motion.div {...fadeUp(0)} className="mb-16">
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">{c.featuresTitle}</h2>
          <p className="text-xl text-slate-400 font-bold">{c.featuresSub}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {c.features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className={`p-10 bg-white dark:bg-zinc-900 rounded-[40px] border-[4px] border-black dark:border-white ${f.shadow} hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all`}>
                <div className={`w-16 h-16 ${f.color} text-white rounded-2xl flex items-center justify-center mb-8 border-[3px] border-black dark:border-white/20`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3">{f.title}</h3>
                <p className="text-slate-500 dark:text-zinc-400 font-bold leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-slate-900 dark:bg-zinc-950 text-white border-y-[4px] border-black dark:border-white/20">
        <div className="max-w-6xl mx-auto px-8 py-28">
          <motion.div {...fadeUp(0)} className="mb-16">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">{c.howTitle}</h2>
            <p className="text-xl text-zinc-400 font-bold">{c.howSub}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {c.steps.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.12)}
                className="relative p-10 rounded-[32px] border-[4px] border-white/20 hover:border-white/60 transition-colors">
                <div className="text-7xl font-black text-white/10 mb-4 leading-none">{s.n}</div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3">{s.title}</h3>
                <p className="text-zinc-400 font-bold leading-relaxed">{s.desc}</p>
                {i < c.steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-5 text-white/20 text-3xl font-black z-10">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOCKUPS ── */}
      <section className="bg-zinc-950 border-b-[4px] border-black dark:border-white/20">
        <div className="max-w-6xl mx-auto px-8 py-24">
          <motion.div {...fadeUp(0)} className="mb-16">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">{c.mockupTitle}</h2>
            <p className="text-xl text-zinc-400 font-bold">{c.mockupSub}</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div {...fadeUp(0.1)}>
              <MonitorFrame label={c.mockup1Label}>
                <LessonPlanMockup />
              </MonitorFrame>
            </motion.div>
            <motion.div {...fadeUp(0.2)}>
              <MonitorFrame label={c.mockup2Label}>
                <TestMockup />
              </MonitorFrame>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="max-w-6xl mx-auto px-8 py-28 text-center">
        <motion.div {...fadeUp(0)}>
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6">{c.statsTitle}</h2>
          <button onClick={handleCta}
            className="inline-flex items-center gap-5 px-14 py-7 bg-black dark:bg-white text-white dark:text-black text-xl font-black uppercase tracking-widest rounded-[32px] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all mt-10">
            {c.bottomCta} <ChevronRight size={26} strokeWidth={3} />
          </button>
          <p className="mt-5 text-sm text-slate-400 font-bold">{c.bottomCtaSub}</p>
        </motion.div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t-[4px] border-black/10 dark:border-white/10">
        <motion.div {...fadeUp(0)} className="max-w-3xl mx-auto px-8 py-20">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-10">{c.faqTitle}</h2>
          <div>
            {c.faq.map((item, i) => <FaqItem key={i} {...item} />)}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
