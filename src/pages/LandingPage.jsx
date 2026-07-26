import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen, FileQuestion, ClipboardList, Gamepad2, Plus, Minus, Sparkles, Check } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.48, delay },
});

// ─── copy ─────────────────────────────────────────────────────────────────────
const COPY = {
  RU: {
    badge: "AI-платформа для учителей Казахстана",
    h1: "60 секунд —",
    h2: "и урок готов.",
    sub: "ИИ генерирует планы уроков, тесты и отчёты. Вы просто ведёте урок.",
    cta: "Начать бесплатно",
    ctaSub: "Регистрация за 30 секунд · Без карты",
    stats: [
      { value: "60с", label: "на полный план урока" },
      { value: "3", label: "языка: RU / KZ / EN" },
      { value: "100%", label: "бесплатно прямо сейчас" },
    ],
    features: [
      {
        tag: "ПЛАНЫ УРОКОВ",
        title: "Полный план за 60 секунд",
        desc: "Введи предмет, класс и тему — ИИ напишет структурированный план с целями, ходом, дифференциацией и домашним заданием. Забери в DOCX одной кнопкой.",
        bullets: ["Цели и ожидаемые результаты", "Пошаговый ход урока", "Дифференциация по уровням", "Экспорт в DOCX"],
        icon: BookOpen, color: "blue",
      },
      {
        tag: "AI ТЕСТЫ",
        title: "Живая сессия по 4-значному коду",
        desc: "Создай тест по теме и запусти сессию. Ученики заходят с любого устройства по коду — никаких регистраций. Результаты в реальном времени прямо на экране.",
        bullets: ["Генерация теста по теме", "4-значный код доступа", "Результаты в реальном времени", "AI-отчёт по классу"],
        icon: FileQuestion, color: "purple",
      },
      {
        tag: "ИТОГ УРОКА",
        title: "ИИ пишет отчёт за тебя",
        desc: "После теста нажми одну кнопку — ИИ анализирует результаты и пишет отчёт: что прошли, кто отстаёт, домашнее задание. Готово к копированию в Кунделик.",
        bullets: ["Анализ результатов класса", "Список учеников с трудностями", "Готовое домашнее задание", "Копируй прямо в Кунделик"],
        icon: ClipboardList, color: "emerald",
      },
      {
        tag: "ИГРЫ",
        title: "Интерактивные игры прямо на уроке",
        desc: "Вордл для класса, викторины и другие форматы. Учитель задаёт слово или тему — ученики играют со своих телефонов. Без установки приложений.",
        bullets: ["Вордл с классом и в соло", "3 языка: RU, KZ, EN", "Ученики играют с телефонов", "Без установки приложений"],
        icon: Gamepad2, color: "orange",
      },
    ],
    howTitle: "Три шага — и вы готовы",
    steps: [
      { n: "1", title: "Создайте аккаунт", desc: "Регистрация учителя занимает 30 секунд. Никаких карт и подписок." },
      { n: "2", title: "Сгенерируйте контент", desc: "Введите предмет и тему — ИИ создаёт план урока или тест за минуту." },
      { n: "3", title: "Ведите урок", desc: "Запустите тест, следите за результатами, получите итог." },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      { q: "Это полностью бесплатно?", a: "Да. Платформа полностью бесплатна — без скрытых платежей и ограничений по времени." },
      { q: "Нужно что-то устанавливать?", a: "Нет. Всё работает в браузере на компьютере, планшете или телефоне." },
      { q: "Ученикам нужен аккаунт чтобы пройти тест?", a: "Нет. Для теста достаточно 4-значного кода — ученики вводят имя и сразу начинают." },
      { q: "На каких языках работает ИИ?", a: "Генерация и интерфейс поддерживают русский, казахский и английский. Переключается в один клик." },
      { q: "Данные в безопасности?", a: "Данные хранятся в защищённой облачной базе и не передаются третьим лицам." },
    ],
    ctaTitle: "Попробуй прямо сейчас",
    ctaDesc: "Зарегистрируйся и создай первый план урока с ИИ — это займёт меньше минуты.",
  },

  KZ: {
    badge: "Қазақстан мұғалімдеріне арналған AI-платформа",
    h1: "60 секунд —",
    h2: "сабақ дайын.",
    sub: "ЖИ сабақ жоспарларын, тесттер мен есептерді жасайды. Сіз тек сабақ өткізесіз.",
    cta: "Тегін бастау",
    ctaSub: "30 секундта тіркелу · Картасыз",
    stats: [
      { value: "60с", label: "толық сабақ жоспары" },
      { value: "3", label: "тіл: RU / KZ / EN" },
      { value: "100%", label: "қазір тегін" },
    ],
    features: [
      {
        tag: "САБАҚ ЖОСПАРЛАРЫ",
        title: "60 секундта толық жоспар",
        desc: "Пән, сынып және тақырыпты енгізіңіз — ЖИ мақсаттары, барысы және үй тапсырмасы бар жоспар жасайды. DOCX-ке бір батырмамен.",
        bullets: ["Мақсаттар мен күтілетін нәтижелер", "Кезең-кезең барысы", "Деңгей бойынша дифференциация", "DOCX экспорты"],
        icon: BookOpen, color: "blue",
      },
      {
        tag: "AI ТЕСТТЕР",
        title: "4 санды кодпен тікелей сессия",
        desc: "Тақырып бойынша тест жасаңыз. Оқушылар кез-келген құрылғыдан кодпен кіреді — тіркелусіз. Нәтижелер нақты уақытта.",
        bullets: ["Тақырып бойынша тест жасау", "4 санды код", "Нақты уақыттағы нәтижелер", "Сынып бойынша AI-есеп"],
        icon: FileQuestion, color: "purple",
      },
      {
        tag: "САБАҚ ҚОРЫТЫНДЫСЫ",
        title: "ЖИ есепті өзі жазады",
        desc: "Тесттен кейін бір батырма — ЖИ нәтижелерді талдап есеп жазады: нені өттік, кім артта қалды, үй тапсырмасы. Кунделикке дайын.",
        bullets: ["Сынып нәтижелерін талдау", "Артта қалған оқушылар", "Дайын үй тапсырмасы", "Кунделикке көшіру"],
        icon: ClipboardList, color: "emerald",
      },
      {
        tag: "ОЙЫНДАР",
        title: "Сабақта интерактивті ойындар",
        desc: "Сынып үшін Вордл, викториналар. Мұғалім сөз немесе тақырып береді — оқушылар телефондарынан ойнайды. Қосымша орнатусыз.",
        bullets: ["Сыныппен және соло Вордл", "3 тіл: RU, KZ, EN", "Оқушылар телефондарынан ойнайды", "Қосымша орнатусыз"],
        icon: Gamepad2, color: "orange",
      },
    ],
    howTitle: "Үш қадам — дайынсыз",
    steps: [
      { n: "1", title: "Тіркелу", desc: "30 секундта мұғалім аккаунтын жасаңыз. Карта жоқ." },
      { n: "2", title: "Жасау", desc: "Пән мен тақырыпты енгізіңіз — ЖИ бір минутта жоспар немесе тест жасайды." },
      { n: "3", title: "Сабақ", desc: "Тестті іске қосыңыз, нәтижелерді бақылаңыз, қорытынды алыңыз." },
    ],
    faqTitle: "Жиі қойылатын сұрақтар",
    faq: [
      { q: "Бұл толығымен тегін бе?", a: "Иә. Платформа толығымен тегін — жасырын төлемдер жоқ." },
      { q: "Бірдеңе орнату керек пе?", a: "Жоқ. Барлығы браузерде жұмыс істейді." },
      { q: "Тест тапсыру үшін оқушыларға аккаунт қажет пе?", a: "Жоқ. 4 санды код жеткілікті — оқушылар атын енгізіп бірден бастайды." },
      { q: "ЖИ қандай тілдерде жұмыс істейді?", a: "Орыс, қазақ және ағылшын тілдерін қолдайды. Бір батырмамен ауысады." },
      { q: "Деректер қауіпсіз бе?", a: "Деректер қорғалған бұлтты дерекқорда сақталады." },
    ],
    ctaTitle: "Қазір байқап көріңіз",
    ctaDesc: "Тіркеліп, алғашқы AI сабақ жоспарыңызды жасаңыз — бір минуттан аз уақыт алады.",
  },

  EN: {
    badge: "AI platform for teachers in Kazakhstan",
    h1: "60 seconds —",
    h2: "lesson ready.",
    sub: "AI generates lesson plans, quizzes and reports. You just teach.",
    cta: "Get Started Free",
    ctaSub: "Sign up in 30 seconds · No card",
    stats: [
      { value: "60s", label: "for a full lesson plan" },
      { value: "3", label: "languages: RU / KZ / EN" },
      { value: "100%", label: "free right now" },
    ],
    features: [
      {
        tag: "LESSON PLANS",
        title: "Full plan in 60 seconds",
        desc: "Enter subject, grade and topic — AI writes a structured plan with goals, timeline, differentiation and homework. Export to DOCX in one click.",
        bullets: ["Goals and expected outcomes", "Step-by-step lesson flow", "Differentiation by level", "DOCX export"],
        icon: BookOpen, color: "blue",
      },
      {
        tag: "AI QUIZZES",
        title: "Live session with a 4-digit code",
        desc: "Create a quiz by topic and launch a session. Students join from any device with a code — no registration needed. Results come in real time.",
        bullets: ["Quiz generation by topic", "4-digit access code", "Real-time results", "AI class report"],
        icon: FileQuestion, color: "purple",
      },
      {
        tag: "LESSON SUMMARY",
        title: "AI writes the report for you",
        desc: "After the quiz, one click — AI analyzes results and writes a report: what was covered, who's struggling, homework. Ready to paste into Kundelik.",
        bullets: ["Class performance analysis", "Students who need support", "Ready-made homework", "Paste directly into Kundelik"],
        icon: ClipboardList, color: "emerald",
      },
      {
        tag: "GAMES",
        title: "Interactive games right in class",
        desc: "Class Wordle, quizzes and more. Teacher sets a word or topic — students play from their phones. No app install needed.",
        bullets: ["Class and solo Wordle", "3 languages: RU, KZ, EN", "Students play on phones", "No install needed"],
        icon: Gamepad2, color: "orange",
      },
    ],
    howTitle: "Three steps and you're ready",
    steps: [
      { n: "1", title: "Create account", desc: "Teacher registration takes 30 seconds. No card required." },
      { n: "2", title: "Generate content", desc: "Enter subject and topic — AI creates a plan or quiz in a minute." },
      { n: "3", title: "Teach", desc: "Launch the quiz, watch results live, get the summary." },
    ],
    faqTitle: "Frequently Asked Questions",
    faq: [
      { q: "Is it completely free?", a: "Yes. The platform is fully free — no hidden payments or time limits." },
      { q: "Do I need to install anything?", a: "No. Everything runs in the browser on any device." },
      { q: "Do students need an account to take a quiz?", a: "No. A 4-digit code is enough — students enter their name and start immediately." },
      { q: "What languages does the AI support?", a: "Russian, Kazakh and English. Switch in one click." },
      { q: "Is the data safe?", a: "Data is stored in a secure cloud database and never shared with third parties." },
    ],
    ctaTitle: "Try it right now",
    ctaDesc: "Sign up and create your first AI lesson plan — it takes less than a minute.",
  },
};

// ─── Color maps ───────────────────────────────────────────────────────────────
const COLORS = {
  blue:    { bg: "bg-blue-600",    soft: "bg-blue-50 dark:bg-blue-950/40",    text: "text-blue-600",    border: "border-blue-200 dark:border-blue-800",    shadow: "shadow-[6px_6px_0_0_rgba(37,99,235,0.35)]" },
  purple:  { bg: "bg-purple-600",  soft: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-600", border: "border-purple-200 dark:border-purple-800", shadow: "shadow-[6px_6px_0_0_rgba(147,51,234,0.35)]" },
  emerald: { bg: "bg-emerald-600", soft: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600", border: "border-emerald-200 dark:border-emerald-800", shadow: "shadow-[6px_6px_0_0_rgba(5,150,105,0.35)]" },
  orange:  { bg: "bg-orange-500",  soft: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-500",  border: "border-orange-200 dark:border-orange-800",  shadow: "shadow-[6px_6px_0_0_rgba(249,115,22,0.35)]" },
};

// ─── Hero product preview ─────────────────────────────────────────────────────
function HeroPreview() {
  return (
    <div className="w-full rounded-[20px] border-[4px] border-black dark:border-zinc-600 overflow-hidden shadow-[14px_14px_0_0_#000] dark:shadow-[14px_14px_0_0_rgba(255,255,255,0.08)]">
      {/* browser bar */}
      <div className="bg-zinc-800 px-4 py-2.5 flex items-center gap-2 border-b-2 border-black/30">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <div className="flex-1 bg-zinc-700 rounded-full h-5 mx-4 flex items-center px-3">
          <span className="text-[9px] text-zinc-400 font-mono">lessonplanner.kz/dashboard</span>
        </div>
      </div>
      {/* app nav */}
      <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-700">
        <span className="text-[9px] font-black text-white tracking-[0.2em]">LESSON PLANNER</span>
        <div className="flex gap-4">
          {['Hub','Tools','Games','Classes'].map(l => (
            <span key={l} className="text-[8px] font-bold text-zinc-400">{l}</span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-black text-zinc-400 border border-zinc-600 px-1.5 py-0.5 rounded">RU</span>
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[7px] text-white font-black">А</div>
        </div>
      </div>
      {/* dashboard content */}
      <div className="bg-[#f0f4f8] flex" style={{ height: 260 }}>
        {/* sidebar */}
        <div className="w-[90px] bg-white/60 border-r border-black/5 p-2 flex flex-col gap-1 shrink-0">
          <div className="text-[5px] font-black text-black/25 tracking-widest mb-2 px-1">ИСТОРИЯ</div>
          {[['Дроби', true],['Периметр',false],['Площадь',false],['Углы',false],['Вектора',false],['Функции',false]].map(([t,a],i)=>(
            <div key={i} className={`text-[6px] font-bold px-2 py-1.5 rounded-[6px] ${a?'bg-blue-600 text-white':'text-black/40 hover:bg-white/50'}`}>{t}</div>
          ))}
        </div>
        {/* form */}
        <div className="w-[150px] bg-white/70 border-r border-black/5 p-3 flex flex-col gap-1.5 shrink-0">
          <div className="text-[6px] font-black text-blue-600 tracking-widest mb-1">PLANNER</div>
          <div className="flex gap-1">
            <div className="flex-1 bg-slate-100 rounded text-[5.5px] text-black/50 px-1.5 py-1 font-bold">5 Класс</div>
            <div className="flex-1 bg-slate-100 rounded text-[5.5px] text-black/50 px-1.5 py-1 font-bold">45 Мин</div>
          </div>
          <div className="bg-slate-100 rounded text-[5.5px] text-black/50 px-1.5 py-1.5 font-bold">Математика</div>
          <div className="bg-slate-100 rounded text-[5.5px] text-black/50 px-1.5 py-1.5 font-bold">Дроби и части целого</div>
          <div className="bg-slate-100 rounded text-[5.5px] text-black/25 px-1.5 py-5 font-bold">Детали урока...</div>
          <div className="bg-blue-600 rounded text-[5.5px] text-white font-black text-center py-2 mt-auto border border-black shadow-[2px_2px_0_0_#000]">СОЗДАТЬ ПЛАН</div>
        </div>
        {/* output */}
        <div className="flex-1 bg-white/90 p-3 flex flex-col gap-1 overflow-hidden">
          <div className="text-[7px] font-black italic text-black/70 mb-1">## План урока — Дроби и части целого</div>
          <div className="text-[5.5px] text-black/50 italic"><span className="font-black">Предмет:</span> Математика · <span className="font-black">Класс:</span> 5 · <span className="font-black">Время:</span> 45 мин</div>
          <div className="w-full h-px bg-black/8 my-1" />
          <div className="text-[6px] font-black italic text-black/60 mb-0.5">## Цели урока</div>
          {['- Познакомить учеников с понятием обыкновенной дроби','- Формировать навык записи и чтения дробей','- Развить умение сравнивать дроби'].map((l,i)=>(
            <div key={i} className="text-[5px] text-black/40 italic">{l}</div>
          ))}
          <div className="w-full h-px bg-black/8 my-1" />
          <div className="text-[6px] font-black italic text-black/60 mb-0.5">## Ход урока</div>
          {[['Организационный момент','2 мин'],['Актуализация знаний','8 мин'],['Изучение нового материала','15 мин'],['Практическая работа','15 мин'],['Подведение итогов','5 мин']].map(([s,t],i)=>(
            <div key={i} className="flex justify-between text-[5px] text-black/40 italic py-0.5 border-b border-black/4">
              <span>{s}</span><span className="text-black/60 font-bold">{t}</span>
            </div>
          ))}
          <div className="mt-auto pt-1.5 border-t border-black/8">
            <div className="bg-black/6 rounded text-[5.5px] text-black/40 font-black text-center py-1.5 border border-black/10">⬇ ВЫГРУЗИТЬ В DOCX</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature visual panels ────────────────────────────────────────────────────
function FeatureVisual({ color, index }) {
  const c = COLORS[color];
  if (index === 0) return (
    <div className={`${c.soft} rounded-[28px] border-2 ${c.border} p-6 h-full flex flex-col gap-3`}>
      <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Результат</div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 p-4 shadow-sm flex-1">
        <div className="text-[11px] font-black italic text-slate-700 dark:text-zinc-200 mb-2">## Ход урока</div>
        {[['Орг. момент','2 мин'],['Актуализация','8 мин'],['Новый материал','15 мин'],['Практика','15 мин'],['Итоги','5 мин']].map(([s,t],i)=>(
          <div key={i} className="flex justify-between text-[10px] font-bold py-1 border-b border-slate-100 dark:border-zinc-700 last:border-0 text-slate-600 dark:text-zinc-300">
            <span>{s}</span><span className="text-blue-500">{t}</span>
          </div>
        ))}
      </div>
      <div className="bg-blue-600 rounded-xl text-[10px] text-white font-black text-center py-2.5 border-2 border-black shadow-[3px_3px_0_0_#000]">⬇ ВЫГРУЗИТЬ В DOCX</div>
    </div>
  );
  if (index === 1) return (
    <div className={`${c.soft} rounded-[28px] border-2 ${c.border} p-6 h-full flex flex-col gap-3 items-center justify-center`}>
      <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Код доступа</div>
      <div className="bg-black rounded-2xl px-8 py-5 text-center border-2 border-black shadow-[6px_6px_0_0_rgba(147,51,234,0.4)]">
        <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Введите код</div>
        <div className="text-6xl font-black font-mono text-yellow-400 tracking-[0.3em]">4279</div>
      </div>
      <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 p-3 shadow-sm">
        <div className="text-[10px] font-black uppercase text-slate-400 mb-2">Результаты</div>
        {[['Айгерим К.','9/10','green'],['Данияр М.','6/10','yellow'],['Зарина Т.','10/10','green']].map(([n,s,col])=>(
          <div key={n} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-zinc-700 last:border-0">
            <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-300">{n}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded text-white ${col==='green'?'bg-green-500':'bg-yellow-500'}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
  if (index === 2) return (
    <div className={`${c.soft} rounded-[28px] border-2 ${c.border} p-6 h-full flex flex-col gap-3`}>
      <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">AI Отчёт</div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 p-4 shadow-sm flex-1 overflow-hidden">
        <div className="text-[11px] font-black text-emerald-600 mb-2">📋 Итог урока · Дроби</div>
        <div className="text-[10px] text-slate-600 dark:text-zinc-300 font-bold leading-relaxed">
          Тема пройдена на <span className="text-emerald-600 font-black">82%</span>. Большинство учеников усвоили материал.
        </div>
        <div className="mt-2 text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Нужна помощь:</div>
        {['Данияр М. — 60%','Ернар С. — 55%'].map((s,i)=>(
          <div key={i} className="text-[10px] text-red-500 font-bold py-0.5">⚠ {s}</div>
        ))}
        <div className="mt-2 text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Домашнее задание:</div>
        <div className="text-[10px] text-slate-600 dark:text-zinc-300 font-bold leading-relaxed">Задачник с. 45, №3–7. Повторить правило сравнения дробей.</div>
      </div>
      <div className="bg-emerald-600 rounded-xl text-[10px] text-white font-black text-center py-2.5 border-2 border-black shadow-[3px_3px_0_0_#000]">Скопировать в Кунделик</div>
    </div>
  );
  return (
    <div className={`${c.soft} rounded-[28px] border-2 ${c.border} p-6 h-full flex flex-col gap-3 items-center justify-center`}>
      <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Вордл — Класс</div>
      <div className="grid gap-1.5">
        {[
          [{l:'С',s:'correct'},{l:'А',s:'absent'},{l:'Б',s:'present'},{l:'А',s:'absent'},{l:'Қ',s:'absent'}],
          [{l:'С',s:'correct'},{l:'О',s:'absent'},{l:'З',s:'absent'},{l:'Д',s:'absent'},{l:'А',s:'absent'}],
          [{l:'С',s:'correct'},{l:'А',s:'correct'},{l:'Б',s:'correct'},{l:'А',s:'correct'},{l:'Қ',s:'correct'}],
        ].map((row,ri)=>(
          <div key={ri} className="flex gap-1.5">
            {row.map((cell,ci)=>(
              <div key={ci} className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border-2 ${
                cell.s==='correct'?'bg-green-500 border-green-600 text-white':
                cell.s==='present'?'bg-yellow-400 border-yellow-500 text-black':
                'bg-slate-600 border-slate-700 text-white'
              }`}>{cell.l}</div>
            ))}
          </div>
        ))}
      </div>
      <div className="text-[10px] text-slate-400 font-bold mt-1">3/6 попыток</div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-zinc-800 last:border-0">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="font-black text-base text-slate-900 dark:text-white">{q}</span>
        {open
          ? <Minus size={16} className="shrink-0 text-blue-500" />
          : <Plus size={16} className="shrink-0 text-slate-400" />}
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="pb-5 text-slate-500 dark:text-zinc-400 font-medium leading-relaxed text-sm">
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
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} isLanding
        setIsAuthOpen={setIsAuthOpen} setAuthMode={setAuthMode} resetAuthFields={resetAuthFields} />

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-8 pt-20 pb-8">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-[11px] font-black tracking-[0.18em] uppercase border border-blue-100 dark:border-blue-800">
            <Sparkles size={11} /> {c.badge}
          </div>
          <h1 className="text-7xl md:text-[88px] font-black uppercase tracking-tighter leading-[0.95] mb-4">
            {c.h1}<br />
            <span className="text-blue-600">{c.h2}</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 dark:text-zinc-400 max-w-xl mx-auto mb-10 font-medium leading-relaxed mt-6">
            {c.sub}
          </p>
          <button onClick={handleCta}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white text-base font-black uppercase tracking-widest rounded-2xl border-[3px] border-black shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all">
            {c.cta} <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <p className="text-xs text-slate-400 font-bold mt-3">{c.ctaSub}</p>
        </motion.div>

        {/* Wide product preview */}
        <motion.div {...fadeUp(0.15)}>
          <HeroPreview />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y-[3px] border-black/8 dark:border-white/8 bg-white dark:bg-zinc-900 mt-16">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <div className="grid grid-cols-3 divide-x-[3px] divide-black/8 dark:divide-white/8">
            {c.stats.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="text-center px-6 py-2">
                <div className="text-4xl md:text-5xl font-black text-blue-600 mb-1">{s.value}</div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-8 py-24 space-y-24">
        {c.features.map((f, i) => {
          const Icon = f.icon;
          const col = COLORS[f.color];
          const isEven = i % 2 === 0;
          return (
            <motion.div key={i} {...fadeUp(0.05)}
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center ${!isEven ? 'md:[direction:rtl]' : ''}`}>
              {/* Text */}
              <div className={!isEven ? 'md:[direction:ltr]' : ''}>
                <div className={`inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] ${col.text} uppercase mb-5`}>
                  <div className={`w-7 h-7 ${col.bg} text-white rounded-lg flex items-center justify-center border-2 border-black`}>
                    <Icon size={14} />
                  </div>
                  {f.tag}
                </div>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 leading-tight">{f.title}</h3>
                <p className="text-slate-500 dark:text-zinc-400 font-medium leading-relaxed mb-7 text-base">{f.desc}</p>
                <ul className="space-y-2.5">
                  {f.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-center gap-3 text-sm font-bold">
                      <span className={`w-5 h-5 ${col.bg} rounded-full flex items-center justify-center shrink-0 border-2 border-black`}>
                        <Check size={11} color="white" strokeWidth={3} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Visual */}
              <div className={!isEven ? 'md:[direction:ltr]' : ''} style={{ minHeight: 300 }}>
                <FeatureVisual color={f.color} index={i} />
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-zinc-950 text-white border-y-[4px] border-black">
        <div className="max-w-6xl mx-auto px-8 py-24">
          <motion.div {...fadeUp(0)} className="mb-14 text-center">
            <div className="text-[11px] font-black tracking-[0.25em] text-blue-400 uppercase mb-3">
              {lang === "KZ" ? "ҚАЛАЙ ЖҰМЫС ІСТЕЙДІ" : lang === "EN" ? "HOW IT WORKS" : "КАК ЭТО РАБОТАЕТ"}
            </div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">{c.howTitle}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.steps.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="relative p-10 rounded-[28px] border-[3px] border-white/12 hover:border-white/30 transition-colors">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl mb-6 border-2 border-white/20">
                  {s.n}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{s.title}</h3>
                <p className="text-zinc-400 font-medium leading-relaxed text-sm">{s.desc}</p>
                {i < c.steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-4 text-white/20 text-xl font-black z-10">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="max-w-4xl mx-auto px-8 py-28 text-center">
        <motion.div {...fadeUp(0)}>
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-5">{c.ctaTitle}</h2>
          <p className="text-lg text-slate-400 font-medium mb-10 max-w-lg mx-auto leading-relaxed">{c.ctaDesc}</p>
          <button onClick={handleCta}
            className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white text-base font-black uppercase tracking-widest rounded-2xl border-[3px] border-black shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all">
            {c.cta} <ChevronRight size={20} strokeWidth={3} />
          </button>
          <p className="mt-4 text-xs text-slate-400 font-bold">{c.ctaSub}</p>
        </motion.div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-8 py-20">
          <motion.div {...fadeUp(0)} className="mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter">{c.faqTitle}</h2>
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
