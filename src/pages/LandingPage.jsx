import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight, BookOpen, FileQuestion, ClipboardList,
  Gamepad2, Plus, Minus, Sparkles, Zap, Globe,
} from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, delay },
});

const COPY = {
  RU: {
    badge: "AI-ПЛАТФОРМА ДЛЯ УЧИТЕЛЕЙ",
    hero1: "Меньше бумаги.",
    hero2: "Больше урока.",
    sub: "Генерация планов, AI-тесты в реальном времени, автоматические отчёты и игры для класса — всё в одном месте.",
    cta: "Начать бесплатно",
    ctaSub: "Регистрация за 30 секунд · Бесплатно",
    stats: [
      { value: "60с", label: "план урока" },
      { value: "3", label: "языка" },
      { value: "100%", label: "бесплатно" },
    ],
    featuresLabel: "ВОЗМОЖНОСТИ",
    featuresTitle: "Всё что нужно учителю",
    featuresSub: "Один инструмент закрывает всю рутину.",
    features: [
      {
        icon: BookOpen, color: "bg-blue-600", light: "bg-blue-50 dark:bg-blue-900/20", accent: "text-blue-600",
        tag: "ПЛАНИРОВАНИЕ",
        title: "Планы уроков за 60 секунд",
        desc: "Введи предмет, класс и тему — ИИ генерирует полный структурированный план с целями, ходом урока, дифференциацией и домашним заданием. Экспорт в DOCX одной кнопкой.",
        details: ["Цели и задачи урока", "Пошаговый ход урока", "Дифференциация", "Экспорт в DOCX"],
      },
      {
        icon: FileQuestion, color: "bg-purple-600", light: "bg-purple-50 dark:bg-purple-900/20", accent: "text-purple-600",
        tag: "ТЕСТЫ",
        title: "AI-тесты с живой сессией",
        desc: "Создай тест по теме за секунды и запусти живую сессию. Ученики заходят по 4-значному коду с любого устройства, результаты приходят в реальном времени.",
        details: ["4-значный код доступа", "Результаты в реальном времени", "AI-отчёт после теста", "История всех тестов"],
      },
      {
        icon: ClipboardList, color: "bg-emerald-600", light: "bg-emerald-50 dark:bg-emerald-900/20", accent: "text-emerald-600",
        tag: "ОТЧЁТЫ",
        title: "Итог урока — пиши ИИ",
        desc: "После теста нажми одну кнопку — ИИ пишет отчёт: что прошли, кому нужна помощь, домашнее задание. Готово к вставке в Кунделик.",
        details: ["Автоматический анализ", "Список отстающих", "Рекомендации", "Готово для Кунделик"],
      },
      {
        icon: Gamepad2, color: "bg-orange-500", light: "bg-orange-50 dark:bg-orange-900/20", accent: "text-orange-500",
        tag: "ИГРЫ",
        title: "Интерактивные игры для класса",
        desc: "Вордл с классом, викторины и другие форматы прямо на уроке. Учитель задаёт слово или тему, ученики играют со своих телефонов в реальном времени.",
        details: ["Вордл для класса", "Соло-режим", "3 языка: RU / KZ / EN", "Без установок"],
      },
    ],
    howLabel: "КАК ЭТО РАБОТАЕТ",
    howTitle: "Три шага — и урок готов",
    steps: [
      { n: "01", title: "Регистрация", desc: "Создай аккаунт учителя за 30 секунд. Никаких карт и подписок." },
      { n: "02", title: "Генерация", desc: "Введи предмет и тему. ИИ создаёт план или тест за минуту." },
      { n: "03", title: "Урок", desc: "Запусти тест, следи за результатами, получи итог." },
    ],
    mockupLabel: "ИНТЕРФЕЙС",
    mockupTitle: "Просто и понятно",
    mockupSub: "Ничего лишнего — только то, что нужно на уроке.",
    mockup1Label: "Генератор планов урока",
    mockup2Label: "AI Тесты — живая сессия",
    forLabel: "ДЛЯ КОГО",
    forTitle: "Для учителей и учеников",
    forTeacher: "Для учителей",
    forTeacherItems: ["Планы уроков с экспортом в DOCX", "AI-тесты с кодом доступа", "Итоги и отчёты", "Управление классами"],
    forStudent: "Для учеников",
    forStudentItems: ["Вступление в класс по коду", "Прохождение тестов", "История результатов", "Разбор ошибок"],
    faqTitle: "Частые вопросы",
    faq: [
      { q: "Это бесплатно?", a: "Да, платформа полностью бесплатна. Никаких скрытых платежей." },
      { q: "Нужно что-то устанавливать?", a: "Нет. Всё работает в браузере — на компьютере, планшете или телефоне." },
      { q: "На каких языках работает?", a: "Интерфейс и генерация поддерживают русский, казахский и английский. Переключается в один клик." },
      { q: "Могут ли ученики пользоваться платформой?", a: "Да. Ученики регистрируются отдельно, вступают в класс по коду и проходят тесты." },
    ],
    bottomCta: "Начать бесплатно",
    bottomCtaSub: "Без карты. Без подписки.",
  },

  KZ: {
    badge: "МҰҒАЛІМДЕРГЕ АРНАЛҒАН AI-ПЛАТФОРМА",
    hero1: "Аз қағаз.",
    hero2: "Көп сабақ.",
    sub: "Жоспарлар жасау, AI-тесттер, автоматты есептер және сынып ойындары — барлығы бір жерде.",
    cta: "Тегін бастау",
    ctaSub: "30 секундта тіркелу · Тегін",
    stats: [
      { value: "60с", label: "сабақ жоспары" },
      { value: "3", label: "тіл" },
      { value: "100%", label: "тегін" },
    ],
    featuresLabel: "МҮМКІНДІКТЕР",
    featuresTitle: "Мұғалімге қажетті барлығы",
    featuresSub: "Бір құрал барлық рутинді жабады.",
    features: [
      {
        icon: BookOpen, color: "bg-blue-600", light: "bg-blue-50 dark:bg-blue-900/20", accent: "text-blue-600",
        tag: "ЖОСПАРЛАУ",
        title: "60 секундта сабақ жоспары",
        desc: "Пән, сынып және тақырыпты енгізіңіз — ЖИ мақсаттары, барысы және үй тапсырмасы бар толық жоспар жасайды. DOCX-ке бір батырмамен.",
        details: ["Сабақ мақсаттары", "Кезең-кезең барысы", "Дифференциация", "DOCX экспорты"],
      },
      {
        icon: FileQuestion, color: "bg-purple-600", light: "bg-purple-50 dark:bg-purple-900/20", accent: "text-purple-600",
        tag: "ТЕСТТЕР",
        title: "AI-тесттер тікелей сессиямен",
        desc: "Тақырып бойынша тест жасаңыз және тікелей сессия іске қосыңыз. Оқушылар кез-келген құрылғыдан 4 санды кодпен кіреді.",
        details: ["4 санды код", "Нақты уақыттағы нәтижелер", "AI-есеп", "Тест тарихы"],
      },
      {
        icon: ClipboardList, color: "bg-emerald-600", light: "bg-emerald-50 dark:bg-emerald-900/20", accent: "text-emerald-600",
        tag: "ЕСЕПТЕР",
        title: "Сабақ қорытындысы",
        desc: "Тесттен кейін бір батырма — ЖИ есеп жазады: нені өттік, кімге көмек қажет, үй тапсырмасы. Кунделикке дайын.",
        details: ["Автоматты талдау", "Артта қалғандар", "Ұсыныстар", "Кунделикке дайын"],
      },
      {
        icon: Gamepad2, color: "bg-orange-500", light: "bg-orange-50 dark:bg-orange-900/20", accent: "text-orange-500",
        tag: "ОЙЫНДАР",
        title: "Сынып үшін интерактивті ойындар",
        desc: "Сабақта Вордл, викториналар. Мұғалім сөз немесе тақырып береді, оқушылар нақты уақытта телефондарынан ойнайды.",
        details: ["Сынып Вордлы", "Соло режим", "3 тіл: RU / KZ / EN", "Орнатусыз"],
      },
    ],
    howLabel: "ҚАЛАЙ ЖҰМЫС ІСТЕЙДІ",
    howTitle: "Үш қадам — сабақ дайын",
    steps: [
      { n: "01", title: "Тіркелу", desc: "30 секундта мұғалім аккаунтын жасаңыз. Карта жоқ." },
      { n: "02", title: "Жасау", desc: "Пән мен тақырыпты енгізіңіз. ЖИ бір минутта жоспар немесе тест жасайды." },
      { n: "03", title: "Сабақ", desc: "Тестті іске қосыңыз, нәтижелерді бақылаңыз, қорытынды алыңыз." },
    ],
    mockupLabel: "ИНТЕРФЕЙС",
    mockupTitle: "Қарапайым және түсінікті",
    mockupSub: "Артық ештеңе жоқ — тек сабаққа қажеттінің бәрі.",
    mockup1Label: "Сабақ жоспарын генератор",
    mockup2Label: "AI Тесттер — тікелей сессия",
    forLabel: "КІМ ҮШІН",
    forTitle: "Мұғалімдер мен оқушылар үшін",
    forTeacher: "Мұғалімдерге",
    forTeacherItems: ["DOCX экспорты бар сабақ жоспарлары", "Кодпен AI-тесттер", "Қорытындылар мен есептер", "Сыныптарды басқару"],
    forStudent: "Оқушыларға",
    forStudentItems: ["Кодпен сыныпқа кіру", "Тесттер тапсыру", "Нәтижелер тарихы", "Қателерді талдау"],
    faqTitle: "Жиі қойылатын сұрақтар",
    faq: [
      { q: "Бұл тегін бе?", a: "Иә, платформа толығымен тегін. Жасырын төлемдер жоқ." },
      { q: "Бірдеңе орнату керек пе?", a: "Жоқ. Барлығы браузерде жұмыс істейді." },
      { q: "Қандай тілдерде жұмыс істейді?", a: "Орыс, қазақ және ағылшын тілдерін қолдайды." },
      { q: "Оқушылар пайдалана ала ма?", a: "Иә. Оқушылар жеке тіркеліп, кодпен сыныпқа кіреді." },
    ],
    bottomCta: "Тегін бастау",
    bottomCtaSub: "Картасыз. Жазылымсыз.",
  },

  EN: {
    badge: "AI PLATFORM FOR TEACHERS",
    hero1: "Less paperwork.",
    hero2: "More teaching.",
    sub: "AI lesson plans, live quiz sessions, automated reports and classroom games — all in one place.",
    cta: "Get Started Free",
    ctaSub: "Sign up in 30 seconds · Free",
    stats: [
      { value: "60s", label: "lesson plan" },
      { value: "3", label: "languages" },
      { value: "100%", label: "free" },
    ],
    featuresLabel: "FEATURES",
    featuresTitle: "Everything a teacher needs",
    featuresSub: "One tool covers all the routine.",
    features: [
      {
        icon: BookOpen, color: "bg-blue-600", light: "bg-blue-50 dark:bg-blue-900/20", accent: "text-blue-600",
        tag: "PLANNING",
        title: "Lesson plans in 60 seconds",
        desc: "Enter subject, grade and topic — AI generates a full structured plan with goals, timeline, differentiation and homework. One-click DOCX export.",
        details: ["Lesson goals", "Step-by-step timeline", "Differentiation", "DOCX export"],
      },
      {
        icon: FileQuestion, color: "bg-purple-600", light: "bg-purple-50 dark:bg-purple-900/20", accent: "text-purple-600",
        tag: "QUIZZES",
        title: "AI quizzes with live sessions",
        desc: "Create a quiz by topic in seconds and launch a live session. Students join from any device with a 4-digit code, results arrive in real time.",
        details: ["4-digit access code", "Real-time results", "AI report after quiz", "Full quiz history"],
      },
      {
        icon: ClipboardList, color: "bg-emerald-600", light: "bg-emerald-50 dark:bg-emerald-900/20", accent: "text-emerald-600",
        tag: "REPORTS",
        title: "AI writes the lesson summary",
        desc: "After the quiz, one click — AI writes the report: what was covered, who needs help, homework. Ready to paste into Kundelik.",
        details: ["Automatic analysis", "At-risk students", "Recommendations", "Kundelik-ready"],
      },
      {
        icon: Gamepad2, color: "bg-orange-500", light: "bg-orange-50 dark:bg-orange-900/20", accent: "text-orange-500",
        tag: "GAMES",
        title: "Interactive games for the class",
        desc: "Wordle, quizzes and more right in the lesson. Teacher sets the word or topic, students play from their phones in real time.",
        details: ["Class Wordle", "Solo mode", "3 languages: RU / KZ / EN", "No install needed"],
      },
    ],
    howLabel: "HOW IT WORKS",
    howTitle: "Three steps and you're ready",
    steps: [
      { n: "01", title: "Sign up", desc: "Create a teacher account in 30 seconds. No card required." },
      { n: "02", title: "Generate", desc: "Enter subject and topic. AI creates a plan or quiz in a minute." },
      { n: "03", title: "Teach", desc: "Launch the quiz, watch results live, get the summary." },
    ],
    mockupLabel: "INTERFACE",
    mockupTitle: "Simple and clear",
    mockupSub: "Nothing extra — just what you need for the lesson.",
    mockup1Label: "Lesson Plan Generator",
    mockup2Label: "AI Tests — live session",
    forLabel: "WHO IT'S FOR",
    forTitle: "For teachers and students",
    forTeacher: "For Teachers",
    forTeacherItems: ["Lesson plans with DOCX export", "AI quizzes with access code", "Summaries and reports", "Class management"],
    forStudent: "For Students",
    forStudentItems: ["Join class by code", "Take quizzes", "Results history", "Error breakdown"],
    faqTitle: "Frequently Asked Questions",
    faq: [
      { q: "Is it free?", a: "Yes, the platform is completely free. No hidden fees." },
      { q: "Do I need to install anything?", a: "No. Everything runs in the browser." },
      { q: "What languages does it support?", a: "Russian, Kazakh and English. Switch in one click." },
      { q: "Can students use the platform?", a: "Yes. Students register separately and join a class with a code." },
    ],
    bottomCta: "Get Started Free",
    bottomCtaSub: "No card. No subscription.",
  },
};

// ─── Mockup components ────────────────────────────────────────────────────────

function MonitorFrame({ label, children }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full rounded-t-2xl border-[5px] border-black dark:border-zinc-600 overflow-hidden shadow-[10px_10px_0_0_#000] dark:shadow-[10px_10px_0_0_rgba(255,255,255,0.1)]">
        <div className="bg-zinc-800 px-3 py-2 flex items-center gap-2 border-b-2 border-black/30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <div className="flex-1 bg-zinc-700 rounded-full h-4 mx-3 flex items-center px-2">
            <span className="text-[7px] text-zinc-400 font-mono">lessonplanner.kz</span>
          </div>
        </div>
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
        <div className="bg-zinc-950" style={{ height: 240 }}>
          {children}
        </div>
      </div>
      <div className="w-16 h-3 bg-zinc-700 dark:bg-zinc-600" />
      <div className="w-28 h-2 bg-zinc-800 dark:bg-zinc-700 rounded-full" />
      <p className="mt-3 text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}

function LessonPlanMockup() {
  return (
    <div className="flex h-full gap-1.5 p-1.5 text-white bg-[#f0f4f8]">
      <div className="w-[52px] bg-white/60 rounded-[12px] p-1.5 flex flex-col gap-1 shrink-0 shadow-sm">
        <div className="text-[4.5px] font-black text-black/25 tracking-[0.2em] mb-1.5">ИСТОРИЯ</div>
        {[['Дроби', true], ['Периметр', false], ['Площадь', false], ['Углы', false], ['Тригон.', false]].map(([item, active], i) => (
          <div key={i} className={`text-[5.5px] font-bold px-1.5 py-1 rounded-[6px] transition-all ${active ? 'bg-blue-600 text-white ring-2 ring-blue-400/30' : 'text-black/40 bg-white/50'}`}>{item}</div>
        ))}
      </div>
      <div className="w-[86px] bg-white/70 rounded-[12px] p-2 flex flex-col gap-1 shrink-0 shadow-sm">
        <div className="text-[5px] font-black text-blue-600 tracking-widest mb-1">PLANNER</div>
        <div className="flex gap-1">
          <div className="flex-1 bg-slate-100 rounded-[4px] text-[5px] text-black/50 px-1 py-0.5 text-center font-bold">5 Класс</div>
          <div className="flex-1 bg-slate-100 rounded-[4px] text-[5px] text-black/50 px-1 py-0.5 text-center font-bold">45 Мин</div>
        </div>
        <div className="bg-slate-100 rounded-[4px] text-[5px] text-black/50 px-1.5 py-1 font-bold">Математика</div>
        <div className="bg-slate-100 rounded-[4px] text-[5px] text-black/50 px-1.5 py-1 font-bold">Дроби и части</div>
        <div className="bg-slate-100 rounded-[4px] text-[5px] text-black/30 px-1.5 py-4 font-bold">Детали...</div>
        <div className="bg-blue-600 rounded-[6px] text-[4.5px] text-white font-black text-center py-1.5 mt-auto border-[1.5px] border-black shadow-[2px_2px_0_0_#000]">СОЗДАТЬ ПЛАН</div>
      </div>
      <div className="flex-1 bg-white/90 rounded-[12px] p-2 flex flex-col gap-0.5 min-w-0 shadow-sm overflow-hidden">
        <div className="text-[5.5px] font-black italic text-black/70 mb-0.5">## План урока</div>
        <div className="text-[4.5px] text-black/50 italic"><span className="font-black">Предмет:</span> Математика</div>
        <div className="text-[4.5px] text-black/50 italic"><span className="font-black">Тема:</span> Дроби и части</div>
        <div className="w-full h-px bg-black/10 my-0.5" />
        <div className="text-[5px] font-black italic text-black/60">## Цели урока</div>
        {['- Познакомить учеников с понятием дроби', '- Развить навыки вычислений', '- Применить знания на практике'].map((l, i) => (
          <div key={i} className="text-[4px] text-black/40 italic">{l}</div>
        ))}
        <div className="w-full h-px bg-black/10 my-0.5" />
        <div className="text-[5px] font-black italic text-black/60">## Ход урока</div>
        {[['Введение', '5 мин'], ['Объяснение', '15 мин'], ['Практика', '20 мин']].map(([s, ti], i) => (
          <div key={i} className="flex justify-between text-[4px] text-black/40 italic py-px border-b border-black/5">
            <span>{s}</span><span>{ti}</span>
          </div>
        ))}
        <div className="mt-auto pt-1 border-t border-black/10">
          <div className="bg-black/8 rounded-[4px] text-[4.5px] text-black/40 font-black text-center py-1">ВЫГРУЗИТЬ DOCX</div>
        </div>
      </div>
    </div>
  );
}

function TestMockup() {
  return (
    <div className="flex h-full gap-1.5 p-1.5 bg-[#f8fafc]">
      <div className="flex-1 flex flex-col gap-1.5 min-w-0 overflow-hidden">
        <div className="bg-white rounded-[8px] border-[1.5px] border-black shadow-[2px_2px_0_0_#000] p-1.5 shrink-0">
          <div className="flex gap-1 mb-1">
            <div className="flex-1 bg-slate-100 rounded-[3px] text-[4.5px] text-black/50 px-1 py-0.5 font-bold">Математика</div>
            <div className="bg-slate-100 rounded-[3px] text-[4.5px] text-black/50 px-1 py-0.5 font-bold">5 кл</div>
          </div>
          <div className="bg-slate-100 rounded-[3px] text-[4.5px] text-black/50 px-1 py-0.5 font-bold mb-1">Дроби и части</div>
          <div className="bg-blue-600 rounded-[4px] text-[4.5px] text-white font-black text-center py-1 border border-black shadow-[1.5px_1.5px_0_0_#000]">СОЗДАТЬ ТЕСТ</div>
        </div>
        <div className="bg-white rounded-[8px] border-[1.5px] border-blue-600 shadow-[2px_2px_0_0_#2563eb] p-1.5 flex-1 overflow-hidden flex flex-col gap-1">
          <div className="flex items-start justify-between pb-1 border-b border-gray-100">
            <div>
              <div className="text-[5.5px] font-black text-blue-600 uppercase">Математика</div>
              <div className="text-[4px] text-black/40 font-bold">Дроби и части</div>
            </div>
            <div className="bg-black rounded-[4px] px-1.5 py-0.5 text-center">
              <div className="text-[3px] text-white/60 uppercase tracking-widest">Access Code</div>
              <div className="text-[9px] font-black font-mono text-yellow-400 tracking-[0.2em] leading-none">4279</div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-[5px] border border-slate-100 overflow-hidden flex-1">
            <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-gray-100">
              <span className="text-[4px] font-black uppercase text-black">📊 Class Performance</span>
              <span className="text-[3.5px] bg-purple-600 text-white font-black px-1 py-0.5 rounded">AI Report</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-[3.5px] font-black uppercase text-gray-400 border-b border-gray-100">
                  <th className="px-1.5 py-0.5 text-left">Student</th>
                  <th className="px-1.5 py-0.5 text-left">Score</th>
                  <th className="px-1.5 py-0.5 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {[['Айгерим К.', '9/10', 'green'], ['Данияр М.', '6/10', 'yellow'], ['Зарина Т.', '10/10', 'green']].map(([n, sc, color]) => (
                  <tr key={n} className="border-t border-gray-50">
                    <td className="px-1.5 py-0.5 text-[4px] font-bold text-black/70">{n}</td>
                    <td className="px-1.5 py-0.5">
                      <span className={`text-[3.5px] font-black text-white px-1 rounded ${color === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}>{sc}</span>
                    </td>
                    <td className="px-1.5 py-0.5 text-[3.5px] text-gray-400">42s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="w-[50px] bg-white/80 rounded-[8px] p-1.5 shrink-0 overflow-hidden border border-gray-100">
        <div className="text-[4px] font-black text-black/25 tracking-widest mb-1">ИСТОРИЯ</div>
        {[['Дроби', '07/25', true], ['Периметр', '07/23', false], ['Площадь', '07/20', false], ['Углы', '07/18', false]].map(([topic, date, active]) => (
          <div key={topic} className={`p-1 rounded-[4px] mb-0.5 border-2 ${active ? 'bg-blue-600 border-black text-white' : 'bg-white border-gray-100 text-black/60'}`}>
            <div className="text-[4.5px] font-black truncate">{topic}</div>
            <div className="text-[3.5px] opacity-60">{date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b-2 border-black/8 dark:border-white/8 last:border-0">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="font-black text-base">{q}</span>
        {open ? <Minus size={18} className="shrink-0 text-blue-600" /> : <Plus size={18} className="shrink-0 text-slate-400" />}
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="pb-5 text-slate-500 dark:text-zinc-400 font-bold leading-relaxed text-sm">
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
      <section className="max-w-6xl mx-auto px-8 pt-24 pb-16 text-center">
        <motion.div {...fadeUp(0)}>
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-black tracking-[0.2em] uppercase border border-blue-100 dark:border-blue-800">
            <Sparkles size={12} /> {c.badge}
          </div>
        </motion.div>

        <motion.h1 {...fadeUp(0.08)} className="text-7xl md:text-[96px] font-black uppercase tracking-tighter leading-[1] mb-3">
          {c.hero1}
        </motion.h1>
        <motion.h1 {...fadeUp(0.14)} className="text-7xl md:text-[96px] font-black uppercase tracking-tighter leading-[1] mb-10 text-blue-600">
          {c.hero2}
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="text-xl md:text-2xl opacity-50 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          {c.sub}
        </motion.p>

        <motion.div {...fadeUp(0.26)} className="flex flex-col items-center gap-4">
          <button onClick={handleCta}
            className="group inline-flex items-center gap-4 px-12 py-6 bg-blue-600 text-white text-lg font-black uppercase tracking-widest rounded-[28px] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
            {c.cta} <ChevronRight size={22} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-sm text-slate-400 font-bold">{c.ctaSub}</p>
        </motion.div>

        {/* Stats row */}
        <motion.div {...fadeUp(0.32)} className="mt-16 flex flex-wrap justify-center gap-8">
          {c.stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl font-black text-blue-600">{s.value}</span>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <motion.div {...fadeUp(0)} className="mb-14">
          <div className="text-[11px] font-black tracking-[0.25em] text-blue-600 uppercase mb-3">{c.featuresLabel}</div>
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-3">{c.featuresTitle}</h2>
          <p className="text-lg text-slate-400 dark:text-zinc-400 font-bold">{c.featuresSub}</p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Big card — Lesson Plans */}
          {(() => { const f = c.features[0]; const Icon = f.icon; return (
            <motion.div {...fadeUp(0.05)} key={0}
              className={`md:col-span-7 ${f.light} rounded-[36px] border-[4px] border-black dark:border-white p-10 flex flex-col justify-between min-h-[340px] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.12)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all`}>
              <div>
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 ${f.color} text-white rounded-2xl flex items-center justify-center border-[3px] border-black dark:border-white/20`}>
                    <Icon size={28} />
                  </div>
                  <span className={`text-[10px] font-black tracking-[0.2em] ${f.accent} bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-black/10`}>{f.tag}</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-slate-600 dark:text-zinc-300 font-bold leading-relaxed text-sm">{f.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {f.details.map((d, i) => (
                  <span key={i} className="text-[11px] font-black px-3 py-1 bg-white dark:bg-zinc-900 rounded-full border border-black/10 dark:border-white/10 text-slate-600 dark:text-zinc-300">✓ {d}</span>
                ))}
              </div>
            </motion.div>
          ); })()}

          {/* Small card — AI Tests */}
          {(() => { const f = c.features[1]; const Icon = f.icon; return (
            <motion.div {...fadeUp(0.1)} key={1}
              className={`md:col-span-5 ${f.light} rounded-[36px] border-[4px] border-black dark:border-white p-10 flex flex-col justify-between min-h-[340px] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.12)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all`}>
              <div>
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 ${f.color} text-white rounded-2xl flex items-center justify-center border-[3px] border-black dark:border-white/20`}>
                    <Icon size={28} />
                  </div>
                  <span className={`text-[10px] font-black tracking-[0.2em] ${f.accent} bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-black/10`}>{f.tag}</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-slate-600 dark:text-zinc-300 font-bold leading-relaxed text-sm">{f.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {f.details.map((d, i) => (
                  <span key={i} className="text-[11px] font-black px-3 py-1 bg-white dark:bg-zinc-900 rounded-full border border-black/10 dark:border-white/10 text-slate-600 dark:text-zinc-300">✓ {d}</span>
                ))}
              </div>
            </motion.div>
          ); })()}

          {/* Small card — Summary */}
          {(() => { const f = c.features[2]; const Icon = f.icon; return (
            <motion.div {...fadeUp(0.15)} key={2}
              className={`md:col-span-5 ${f.light} rounded-[36px] border-[4px] border-black dark:border-white p-10 flex flex-col justify-between min-h-[300px] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.12)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all`}>
              <div>
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 ${f.color} text-white rounded-2xl flex items-center justify-center border-[3px] border-black dark:border-white/20`}>
                    <Icon size={28} />
                  </div>
                  <span className={`text-[10px] font-black tracking-[0.2em] ${f.accent} bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-black/10`}>{f.tag}</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-slate-600 dark:text-zinc-300 font-bold leading-relaxed text-sm">{f.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {f.details.map((d, i) => (
                  <span key={i} className="text-[11px] font-black px-3 py-1 bg-white dark:bg-zinc-900 rounded-full border border-black/10 dark:border-white/10 text-slate-600 dark:text-zinc-300">✓ {d}</span>
                ))}
              </div>
            </motion.div>
          ); })()}

          {/* Big card — Games */}
          {(() => { const f = c.features[3]; const Icon = f.icon; return (
            <motion.div {...fadeUp(0.2)} key={3}
              className={`md:col-span-7 ${f.light} rounded-[36px] border-[4px] border-black dark:border-white p-10 flex flex-col justify-between min-h-[300px] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.12)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all`}>
              <div>
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 ${f.color} text-white rounded-2xl flex items-center justify-center border-[3px] border-black dark:border-white/20`}>
                    <Icon size={28} />
                  </div>
                  <span className={`text-[10px] font-black tracking-[0.2em] ${f.accent} bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-black/10`}>{f.tag}</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-slate-600 dark:text-zinc-300 font-bold leading-relaxed text-sm">{f.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {f.details.map((d, i) => (
                  <span key={i} className="text-[11px] font-black px-3 py-1 bg-white dark:bg-zinc-900 rounded-full border border-black/10 dark:border-white/10 text-slate-600 dark:text-zinc-300">✓ {d}</span>
                ))}
              </div>
            </motion.div>
          ); })()}
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="border-y-[4px] border-black dark:border-white/10 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-8 py-24">
          <motion.div {...fadeUp(0)} className="mb-14">
            <div className="text-[11px] font-black tracking-[0.25em] text-blue-600 uppercase mb-3">{c.forLabel}</div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">{c.forTitle}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div {...fadeUp(0.1)} className="p-10 bg-blue-600 rounded-[36px] border-[4px] border-black shadow-[8px_8px_0_0_#000] text-white">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-8">{c.forTeacher}</h3>
              <ul className="space-y-4">
                {c.forTeacherItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold">
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fadeUp(0.15)} className="p-10 bg-slate-900 dark:bg-zinc-950 rounded-[36px] border-[4px] border-black shadow-[8px_8px_0_0_#000] text-white">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-8">{c.forStudent}</h3>
              <ul className="space-y-4">
                {c.forStudentItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold">
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-zinc-950 text-white border-t-[4px] border-black">
        <div className="max-w-6xl mx-auto px-8 py-24">
          <motion.div {...fadeUp(0)} className="mb-14">
            <div className="text-[11px] font-black tracking-[0.25em] text-blue-400 uppercase mb-3">{c.howLabel}</div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">{c.howTitle}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.steps.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="relative p-10 rounded-[32px] border-[4px] border-white/15 hover:border-white/40 transition-colors bg-white/3">
                <div className="text-8xl font-black text-white/60 mb-6 leading-none">{s.n}</div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3">{s.title}</h3>
                <p className="text-zinc-400 font-bold leading-relaxed">{s.desc}</p>
                {i < c.steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-4 text-white/20 text-2xl font-black z-10">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOCKUPS ── */}
      <section className="bg-zinc-950 border-t border-t-white/10 border-b-[4px] border-b-black">
        <div className="max-w-6xl mx-auto px-8 py-24">
          <motion.div {...fadeUp(0)} className="mb-14">
            <div className="text-[11px] font-black tracking-[0.25em] text-blue-400 uppercase mb-3">{c.mockupLabel}</div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-3">{c.mockupTitle}</h2>
            <p className="text-lg text-zinc-400 font-bold">{c.mockupSub}</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div {...fadeUp(0.1)}>
              <MonitorFrame label={c.mockup1Label}><LessonPlanMockup /></MonitorFrame>
            </motion.div>
            <motion.div {...fadeUp(0.2)}>
              <MonitorFrame label={c.mockup2Label}><TestMockup /></MonitorFrame>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="max-w-6xl mx-auto px-8 py-28 text-center">
        <motion.div {...fadeUp(0)}>
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[11px] font-black tracking-[0.2em] uppercase border border-blue-100 dark:border-blue-800">
            <Zap size={12} /> {lang === "KZ" ? "ТЕГІН БАСТАҢЫЗ" : lang === "EN" ? "START TODAY" : "НАЧНИТЕ СЕГОДНЯ"}
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
            {lang === "KZ" ? "Сабақты жаңа деңгейге шығарыңыз" : lang === "EN" ? "Take your lessons to the next level" : "Поднимите уроки на новый уровень"}
          </h2>
          <p className="text-lg text-slate-400 font-bold mb-12 max-w-xl mx-auto">
            {lang === "KZ" ? "Тіркеліп, бүгін ЖИ-мен сабақ жоспарын жасап көріңіз." : lang === "EN" ? "Sign up and try generating your first AI lesson plan today." : "Зарегистрируйся и попробуй сгенерировать первый план урока с ИИ прямо сейчас."}
          </p>
          <button onClick={handleCta}
            className="inline-flex items-center gap-4 px-12 py-6 bg-blue-600 text-white text-lg font-black uppercase tracking-widest rounded-[28px] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
            {c.bottomCta} <ChevronRight size={22} strokeWidth={3} />
          </button>
          <p className="mt-5 text-sm text-slate-400 font-bold">{c.bottomCtaSub}</p>
        </motion.div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t-[4px] border-black/8 dark:border-white/8">
        <div className="max-w-3xl mx-auto px-8 py-20">
          <motion.div {...fadeUp(0)} className="mb-10">
            <div className="text-[11px] font-black tracking-[0.25em] text-blue-600 uppercase mb-3">FAQ</div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">{c.faqTitle}</h2>
          </motion.div>
          <motion.div {...fadeUp(0.05)}>
            {c.faq.map((item, i) => <FaqItem key={i} {...item} />)}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
