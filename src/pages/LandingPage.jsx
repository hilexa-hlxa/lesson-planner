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
    <div className="flex h-full gap-1.5 p-1.5 text-white bg-[#f0f4f8]">
      {/* Sidebar — aside.w-80, glassmorphism cards */}
      <div className="w-[52px] bg-white/60 rounded-[12px] p-1.5 flex flex-col gap-1 shrink-0 shadow-sm">
        <div className="text-[4.5px] font-black text-black/25 tracking-[0.2em] mb-1.5">ИСТОРИЯ</div>
        {[['Дроби', true], ['Периметр', false], ['Площадь', false], ['Углы', false], ['Тригон.', false]].map(([item, active], i) => (
          <div key={i} className={`text-[5.5px] font-bold px-1.5 py-1 rounded-[6px] transition-all ${active ? 'bg-blue-600 text-white ring-2 ring-blue-400/30' : 'text-black/40 bg-white/50'}`}>{item}</div>
        ))}
      </div>

      {/* Form panel — section.w-[480px], rounded-[40px] */}
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

      {/* Output — section.flex-1, rounded-[40px], italic prose */}
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
      {/* Left column */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0 overflow-hidden">

        {/* Form panel */}
        <div className="bg-white rounded-[8px] border-[1.5px] border-black shadow-[2px_2px_0_0_#000] p-1.5 shrink-0">
          <div className="flex gap-1 mb-1">
            <div className="flex-1 bg-slate-100 rounded-[3px] text-[4.5px] text-black/50 px-1 py-0.5 font-bold">Математика</div>
            <div className="bg-slate-100 rounded-[3px] text-[4.5px] text-black/50 px-1 py-0.5 font-bold">5 кл</div>
          </div>
          <div className="bg-slate-100 rounded-[3px] text-[4.5px] text-black/50 px-1 py-0.5 font-bold mb-1">Дроби и части</div>
          <div className="bg-blue-600 rounded-[4px] text-[4.5px] text-white font-black text-center py-1 border border-black shadow-[1.5px_1.5px_0_0_#000]">СОЗДАТЬ ТЕСТ</div>
        </div>

        {/* Active test card — blue border like real page */}
        <div className="bg-white rounded-[8px] border-[1.5px] border-blue-600 shadow-[2px_2px_0_0_#2563eb] p-1.5 flex-1 overflow-hidden flex flex-col gap-1">
          <div className="flex items-start justify-between pb-1 border-b border-gray-100">
            <div>
              <div className="text-[5.5px] font-black text-blue-600 uppercase">Математика</div>
              <div className="text-[4px] text-black/40 font-bold">Дроби и части</div>
            </div>
            {/* Access code — black box, yellow mono */}
            <div className="bg-black rounded-[4px] px-1.5 py-0.5 text-center">
              <div className="text-[3px] text-white/60 uppercase tracking-widest">Access Code</div>
              <div className="text-[9px] font-black font-mono text-yellow-400 tracking-[0.2em] leading-none">4279</div>
            </div>
          </div>

          {/* Class Performance */}
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

      {/* Right sidebar — History */}
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
      <section className="bg-zinc-950 text-white border-t-[4px] border-black">
        <div className="max-w-6xl mx-auto px-8 py-28">
          <motion.div {...fadeUp(0)} className="mb-16">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">{c.howTitle}</h2>
            <p className="text-xl text-zinc-400 font-bold">{c.howSub}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {c.steps.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.12)}
                className="relative p-10 rounded-[32px] border-[4px] border-white/20 hover:border-white/60 transition-colors">
                <div className="text-7xl font-black text-white/60 mb-4 leading-none">{s.n}</div>
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
      <section className="bg-zinc-950 border-t border-t-white/15 border-b-[4px] border-b-black">
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
            className="inline-flex items-center gap-5 px-14 py-7 bg-blue-600 text-white text-xl font-black uppercase tracking-widest rounded-[32px] border-[4px] border-black shadow-[10px_10px_0px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all mt-10">
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
