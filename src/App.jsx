import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  GraduationCap, FileText, Sun, Moon, 
  ChevronRight, MoreVertical, Edit3, Trash2, Eye, EyeOff, User, LayoutGrid, Gamepad2, LogOut 
} from 'lucide-react';
import api from './api';
import { useLocation } from "react-router-dom";

const DEFAULT_PROMPT_CONFIG = {
  lesson_plan: {
    // “глубокие настройки”
    style: "strict",          // strict | friendly | short
    includeTiming: true,      // поминутка
    includeDifferentiation: true,
    includeAssessment: true,
    includeHomework: true,
    detailLevel: "high",      // low | medium | high
    markdown: true,

    // блоки/секция — юзер их может настраивать не трогая данные урока
    sections: [
      "Цели урока",
      "Оборудование",
      "Ключевые понятия",
      "Ход урока по минутам",
      "Задания",
      "Дифференциация",
      "Оценивание",
      "Домашнее задание",
    ],
  },

  tests: {
    difficulty: "medium",     // easy | medium | hard
    total: 10,

    mcq: { count: 6, options: 4 },        // A/B/C/D
    short: { count: 2 },
    matching: { count: 2 },

    includeAnswers: true,
    markdown: true,
    shuffle: false,
  },
};


function buildPrompt(type, vars, cfg) {
  if (type === "lesson_plan") {
    const c = cfg?.lesson_plan || DEFAULT_PROMPT_CONFIG.lesson_plan;

    const sections = (c.sections || []).map(s => `- ${s}`).join("\n");

    return [
      `Ты — профессиональный методист.`,
      `Составь план урока на языке ${vars.lang}.`,
      ``,
      `Данные урока:`,
      `- Предмет: ${vars.subject}`,
      `- Тема: ${vars.topic}`,
      `- Класс: ${vars.grade}`,
      `- Время: ${vars.duration} минут`,
      vars.details ? `- Детали: ${vars.details}` : null,
      ``,
      `Настройки плана:`,
      `- Стиль: ${c.style}`,
      `- Детализация: ${c.detailLevel}`,
      `- Поминутка: ${c.includeTiming ? "да" : "нет"}`,
      `- Дифференциация: ${c.includeDifferentiation ? "да" : "нет"}`,
      `- Оценивание: ${c.includeAssessment ? "да" : "нет"}`,
      `- ДЗ: ${c.includeHomework ? "да" : "нет"}`,
      `- Формат: ${c.markdown ? "Markdown" : "текст"}`,
      ``,
      `Структура (строго соблюдай порядок):`,
      sections,
      ``,
      `Пиши конкретно, без воды.`,
    ].filter(Boolean).join("\n");
  }

  if (type === "tests") {
    const c = cfg?.tests || DEFAULT_PROMPT_CONFIG.tests;

    return [
      `Ты — преподаватель.`,
      `Сгенерируй тест на языке ${vars.lang}.`,
      ``,
      `Данные:`,
      `- Предмет: ${vars.subject}`,
      `- Тема: ${vars.topic}`,
      `- Класс: ${vars.grade}`,
      vars.details ? `- Детали: ${vars.details}` : null,
      ``,
      `Настройки теста:`,
      `- Сложность: ${c.difficulty}`,
      `- Всего вопросов: ${c.total}`,
      `- MCQ: ${c.mcq.count} вопросов, вариантов: ${c.mcq.options} (A/B/C/D)`,
      `- Короткий ответ: ${c.short.count}`,
      `- Соответствие: ${c.matching.count}`,
      `- Перемешать: ${c.shuffle ? "да" : "нет"}`,
      `- Ответы в конце: ${c.includeAnswers ? "да" : "нет"}`,
      `- Формат: ${c.markdown ? "Markdown" : "текст"}`,
      ``,
      `Требования:`,
      `- Сначала вопросы, затем отдельный блок "Ответы" (если включено).`,
      `- Вопросы должны соответствовать теме и классу.`,
    ].filter(Boolean).join("\n");
  }

  return "";
}


const t = {
  RU: { 
    h: "ИСТОРИЯ", p: "ПАРАМЕТРЫ", r: "РЕЗУЛЬТАТ", s: "Предмет", t: "Тема", d: "Детали", g: "ГЕНЕРИРОВАТЬ", edit: "Изменить", del: "Удалить", exit: "ВЫХОД",
    lt: { hero: "Планируйте уроки эффективно", sub: "Профессиональная система автоматизации учебных планов нового поколения.", login: "Войти", signup: "Регистрация", join: "Начать работу" },
    hub: { title: "Выберите направление", tools: "Инструменты", games: "Игротека (Скоро)", go: "Открыть" },
    prof: { title: "Мой Профиль", mail: "Почта", stats: "Статистика", back: "Назад в Хаб", edit: "Редактировать", empty: "Пустое пространство", save: "Сохранить", cancel: "Отмена" },
    auth: { loginTitle: "С возвращением!", signupTitle: "Создать аккаунт", email: "ПОЧТА", pass: "ПАРОЛЬ", enter: "ВОЙТИ", switchL: "Нет аккаунта? Регистрация", switchS: "Уже есть аккаунт? Войти" },
    menu: { hub: "Перейти в хаб", dashboard: "Перейти в Dashboard", logout: "Выйти", },
    prompts: {
    back: "Назад",
    title: "Настройки промптов",
    subtitle: "Здесь настраиваются “глубокие” параметры генерации (стиль, детализация, блоки, ответы и т.д.).",

    lessonTitle: "Настройки плана урока",
    style: "Стиль",
    detail: "Уровень детализации",

    strict: "Строгий",
    friendly: "Дружелюбный",
    short: "Краткий",

    low: "Низкий",
    medium: "Средний",
    high: "Высокий",

    includeTiming: "Поминутное планирование",
    includeDifferentiation: "Дифференциация",
    includeAssessment: "Оценивание",
    includeHomework: "Домашнее задание",
    markdown: "Формат Markdown",

    testsTitle: "Настройки тестов",
    difficulty: "Сложность",
    total: "Количество вопросов",

    easy: "Лёгкая",
    hard: "Сложная",

    includeAnswers: "Показывать ответы",
    shuffle: "Перемешивать вопросы",

    reset: "Сбросить",
    save: "Сохранить",
  }
  },
  KZ: { 
    h: "ТАРИХ", p: "ПАРАМЕТРЛЕР", r: "НӘТИЖЕ", s: "Пән", t: "Сабақ тақырыбы", d: "Мәліметтер", g: "ҚҰРАСТЫРУ", edit: "Өзгерту", del: "Өшіру", exit: "ШЫҒУ",
    lt: { hero: "Сабақты тиімді жоспарлаңыз", sub: "Оқу жоспарларын автоматты төрде құрастыруға арналған кәсіби жүйе.", login: "Кіру", signup: "Тіркелу", join: "Жұмысты бастау" },
    hub: { title: "Бағытты таңдаңыз", tools: "Құралдар", games: "Ойындар (Жақында)", go: "Ашу" },
    prof: { title: "Менің Профилім", mail: "Пошта", stats: "Статистика", back: "Хабқа қайту", edit: "Өңдеу", empty: "Бос орын", save: "Сақтау", cancel: "Бас тарту" }, 
    auth: { loginTitle: "Қош келдіңіз!", signupTitle: "Тіркелу", email: "ПОШТА", pass: "ҚҰПИЯ СӨЗ", enter: "КІРУ", switchL: "Тіркелмегенсіз бе? Тіркелу", switchS: "Аккаунтыңыз бар ма? Кіру" },
    menu: { hub: "Хабқа өту", dashboard: "Dashboard-қа өту", logout: "Шығу", },
    prompts: {
    back: "Артқа",
    title: "Промпт баптаулары",
    subtitle: "Мұнда генерацияның “терең” параметрлері бапталады (стиль, егжей-тегжей, блоктар, жауаптар және т.б.).",

    lessonTitle: "Сабақ жоспарының баптаулары",
    style: "Стиль",
    detail: "Егжей-тегжей деңгейі",

    strict: "Қатаң",
    friendly: "Достық",
    short: "Қысқа",

    low: "Төмен",
    medium: "Орташа",
    high: "Жоғары",

    includeTiming: "Минуттық жоспарлау",
    includeDifferentiation: "Дифференциация",
    includeAssessment: "Бағалау",
    includeHomework: "Үй тапсырмасы",
    markdown: "Markdown форматы",

    testsTitle: "Тест баптаулары",
    difficulty: "Қиындық деңгейі",
    total: "Сұрақтар саны",

    easy: "Оңай",
    hard: "Қиын",

    includeAnswers: "Жауаптарды көрсету",
    shuffle: "Сұрақтарды араластыру",

    reset: "Қалпына келтіру",
    save: "Сақтау",
  }
  },
  EN: { 
    h: "HISTORY", p: "PARAMETERS", r: "RESULT", s: "Subject", t: "Topic", d: "Details", g: "GENERATE", edit: "Edit", del: "Delete", exit: "EXIT",
    lt: { hero: "Plan Lessons Effectively", sub: "Professional next-generation automated lesson planning system.", login: "Sign In", signup: "Sign Up", join: "Get Started" },
    hub: { title: "Choose Direction", tools: "Tools", games: "Games (Soon)", go: "Open" },
    prof: { title: "My Profile", mail: "Email", stats: "Statistics", back: "Back to Hub", edit: "Edit Profile", empty: "Empty Space", save: "Save", cancel: "Cancel" },
    auth: { loginTitle: "Welcome back!", signupTitle: "Create Account", email: "EMAIL", pass: "PASSWORD", enter: "ENTER", switchL: "Don't have an account? Sign Up", switchS: "Already have an account? Log In" },
    menu: { hub: "Go to Hub", dashboard: "Go to Dashboard", logout: "Log out", },
    prompts: {
    back: "Back",
    title: "Prompt Settings",
    subtitle: "Here you can configure advanced generation parameters (style, detail level, structure, answers, etc.).",

    lessonTitle: "Lesson Plan Settings",
    style: "Style",
    detail: "Detail level",

    strict: "Strict",
    friendly: "Friendly",
    short: "Short",

    low: "Low",
    medium: "Medium",
    high: "High",

    includeTiming: "Minute-by-minute planning",
    includeDifferentiation: "Differentiation",
    includeAssessment: "Assessment",
    includeHomework: "Homework",
    markdown: "Markdown format",

    testsTitle: "Test Settings",
    difficulty: "Difficulty",
    total: "Number of questions",

    easy: "Easy",
    hard: "Hard",

    includeAnswers: "Show answers",
    shuffle: "Shuffle questions",

    reset: "Reset",
    save: "Save",
  }
  }
};

const LanguageSwitcher = ({ lang, setLang }) => {
  const positions = { KZ: '4px', RU: '46px', EN: '88px' };
  return (
    <div className="relative flex bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-full border border-slate-200 dark:border-zinc-700 w-[132px] h-[42px] items-center shrink-0 shadow-sm transition-all">
      <div className="absolute h-[30px] w-[40px] bg-white dark:bg-zinc-500 rounded-full shadow-md transition-all duration-300 ease-in-out" style={{ left: positions[lang] || '46px' }} />
      {["KZ", "RU", "EN"].map((l) => (
        <button key={l} onClick={() => setLang(l)} className={`relative z-10 w-[40px] h-full text-[13px] font-black transition-colors duration-300 flex items-center justify-center ${lang === l ? 'text-blue-600 dark:text-white' : 'opacity-40 hover:opacity-100'}`}>
          {l}
        </button>
      ))}
    </div>
  );
};

const Footer = () => (
  <footer className="py-12 px-12 border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
    <div className="max-w-7xl mx-auto flex justify-between items-center opacity-40 text-[11px] font-black uppercase tracking-[0.2em]">
      <div>© 2026 LESSON.LAB / v1.0.4 STABLE VERSION</div>
    </div>
  </footer>
);

const AuthModal = ({ isOpen, mode, setMode, onClose, email, setEmail, pass, setPass, isFormValid, setUser, isEmailValid, showEmailError, setShowEmailError, lang = "RU" }) => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentLangData = t[lang] || t.RU;
  const authT = currentLangData.auth; 

  if (!isOpen) return null;

  const handleSubmit = async () => { 
    setLoading(true);
    try {
      if (mode === "signup") await api.signup(email, pass, null);
      await api.login(email, pass);
      const me = await api.me();
      setUser(me.user);
      onClose();
      navigate("/hub");
    } catch { 
      alert("Auth Error"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-white/80 dark:bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-12 rounded-[44px] shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 opacity-30 hover:opacity-100 font-bold text-2xl">✕</button>

        <h2 className="text-4xl font-black mb-10 tracking-tight text-slate-900 dark:text-white">
          {mode === "login" ? authT.loginTitle : authT.signupTitle}
        </h2>
        
        <div className="space-y-6">
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            onBlur={() => setShowEmailError(true)} 
            type="email" 
            placeholder={authT.email} 
            className={`w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-blue-500 transition ${showEmailError && !isEmailValid ? "border-red-500" : ""}`} 
          />
          
          <div className="relative">
            <input 
              value={pass} 
              onChange={(e) => setPass(e.target.value)} 
              type={showPass ? "text" : "password"} 
              placeholder={authT.pass} 
              className="w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-blue-500" 
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30">
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button 
            disabled={!isFormValid || loading} 
            onClick={handleSubmit} 
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all ${isFormValid && !loading ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-200 dark:bg-zinc-800 text-slate-400 opacity-50"}`}
          >
            {loading ? "..." : authT.enter}
          </button>
          
          <button 
            onClick={() => setMode(mode === "login" ? "signup" : "login")} 
            className="text-[12px] uppercase font-bold opacity-40 hover:opacity-100 block mx-auto mt-6 tracking-widest text-slate-900 dark:text-white"
          >
            {mode === "login" ? authT.switchL : authT.switchS}
          </button>
        </div>
      </div>
    </div>
  );
};

const HubPage = ({ lang, setLang, user, setUser }) => {
  const cur = t[lang]?.hub || t.RU.hub;
  const navigate = useNavigate();

  const content = {
    RU: {
      teacher: "ДЛЯ УЧИТЕЛЕЙ",
      teacherDesc: "Создание и автоматизация уроков, AI помощник, планы",
      student: "ДЛЯ УЧЕНИКОВ",
      studentDesc: "Обучающие игры, награды, прогресс (Скоро)",
    },
    KZ: {
      teacher: "МҰҒАЛІМДЕРГЕ",
      teacherDesc: "Сабақтарды құрастыру және автоматтандыру, AI көмекші",
      student: "ОҚУШЫЛАРҒА",
      studentDesc: "Оқу ойындары, марапаттар, прогресс (Жақында)",
    },
    EN: {
      teacher: "FOR TEACHERS",
      teacherDesc: "Lesson planning, automation, AI assistant",
      student: "FOR STUDENTS",
      studentDesc: "Learning games, rewards, student progress (Soon)",
    }
  };

  const hubT = content[lang] || content.RU;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px]">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-12 py-8 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="font-black text-3xl italic tracking-tighter flex items-center gap-3 text-blue-600">
          <GraduationCap size={40} /> LESSON.LAB
        </div>
        
        <div className="flex gap-8 items-center">
          <LanguageSwitcher lang={lang} setLang={setLang} /> 
          <Link to="/profile" className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border-2 border-black/10 hover:border-black">
            <User size={20} />
            <span className="font-black uppercase text-[11px] tracking-widest">Account</span>
          </Link>
          <button onClick={async () => { await api.logout().catch(()=>{}); setUser(null); navigate("/"); }} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition">
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-10 py-20 text-center">
        <h1 className="text-7xl font-black uppercase mb-24 tracking-tighter italic">{cur.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* TEACHER ZONE */}
          <Link to="/dashboard" className="group relative p-12 bg-white dark:bg-zinc-900 rounded-[50px] border-[4px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
            <div className="absolute -top-6 left-10 px-6 py-2 bg-blue-600 text-white font-black text-xs rounded-full border-2 border-black uppercase tracking-widest">
              {hubT.teacher}
            </div>
            <div className="flex justify-between items-start mb-10 text-blue-600">
              <LayoutGrid size={64} strokeWidth={2.5} />
              <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-3xl">
                <FileText size={32} />
              </div>
            </div>
            <h2 className="text-4xl font-black uppercase mb-4 text-left tracking-tight">{cur.tools}</h2>
            <p className="text-left text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8 max-w-[280px]">
              {hubT.teacherDesc}
            </p>
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-[0.2em] text-blue-600 group-hover:gap-4 transition-all italic">
              {cur.go} <ChevronRight size={20} strokeWidth={3}/>
            </div>
          </Link>

          {/* STUDENT ZONE */}
          <div className="relative p-12 bg-slate-100 dark:bg-zinc-950 rounded-[50px] border-[4px] border-dashed border-slate-300 dark:border-zinc-800 opacity-60">
            <div className="absolute -top-6 left-10 px-6 py-2 bg-slate-300 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 font-black text-xs rounded-full border-2 border-dashed border-slate-400 uppercase tracking-widest">
              {hubT.student}
            </div>
            <div className="flex justify-between items-start mb-10 text-slate-400">
              <Gamepad2 size={64} strokeWidth={2.5} />
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl">
                <GraduationCap size={32} />
              </div>
            </div>
            <h2 className="text-4xl font-black uppercase mb-4 text-left tracking-tight opacity-50">{cur.games}</h2>
            <p className="text-left text-slate-400 font-bold leading-relaxed mb-8 max-w-[280px]">
              {hubT.studentDesc}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const PromptsPage = ({ lang, promptConfig, setPromptConfig }) => {
  const [local, setLocal] = useState(promptConfig);
  const cur = t[lang]?.prompts || t.RU.prompts;

  useEffect(() => {
    setLocal(promptConfig);
  }, [promptConfig]);

  const curLang = t[lang] || t.RU;

  const save = () => setPromptConfig(local);

  const reset = () => {
    setLocal(DEFAULT_PROMPT_CONFIG);
    setPromptConfig(DEFAULT_PROMPT_CONFIG);
  };

  return (
    
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 font-black uppercase text-[10px] hover:text-blue-600 transition tracking-widest mb-8">
          <ChevronRight size={14} className="rotate-180" /> {cur.back}
        </Link>
        <h1 className="text-4xl font-black tracking-tight mb-3">
          {cur.title}
        </h1>
        <p className="opacity-60 font-medium mb-10 whitespace-pre-line">
          {cur.subtitle}
        </p>
        <div className="space-y-10">
          {/* LESSON PLAN SETTINGS */}
          <div className="p-8 bg-white/70 dark:bg-zinc-900/60 rounded-[32px] border border-white/20 shadow-xl">
            <h2 className="font-black uppercase tracking-widest text-[12px] mb-6 text-blue-600">
              {cur.lessonTitle}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                  {cur.style}
                </div>
                <select
                  value={local.lesson_plan.style}
                  onChange={(e) => setLocal({
                    ...local,
                    lesson_plan: { ...local.lesson_plan, style: e.target.value }
                  })}
                  className="w-full p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm"
                >
                  <option value="strict">{cur.strict}</option>
                  <option value="friendly">{cur.friendly}</option>
                  <option value="short">{cur.short}</option>
                </select>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                  {cur.detail}
                </div>
                <select
                  value={local.lesson_plan.detailLevel}
                  onChange={(e) => setLocal({
                    ...local,
                    lesson_plan: { ...local.lesson_plan, detailLevel: e.target.value }
                  })}
                  className="w-full p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm"
                >
                  <option value="low">{cur.low}</option>
                  <option value="medium">{cur.medium}</option>
                  <option value="high">{cur.high}</option>
                </select>
              </div>

              {[
                ["includeTiming", cur.includeTiming],
                ["includeDifferentiation", cur.includeDifferentiation],
                ["includeAssessment", cur.includeAssessment],
                ["includeHomework", cur.includeHomework],
                ["markdown", cur.markdown],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm">
                  <input
                    type="checkbox"
                    checked={!!local.lesson_plan[key]}
                    onChange={(e) => setLocal({
                      ...local,
                      lesson_plan: { ...local.lesson_plan, [key]: e.target.checked }
                    })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* TESTS SETTINGS */}
          <div className="p-8 bg-white/70 dark:bg-zinc-900/60 rounded-[32px] border border-white/20 shadow-xl">
            <h2 className="font-black uppercase tracking-widest text-[12px] mb-6 text-blue-600">
              {cur.testsTitle}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                  {cur.difficulty}
                </div>
                <select
                  value={local.tests.difficulty}
                  onChange={(e) => setLocal({
                    ...local,
                    tests: { ...local.tests, difficulty: e.target.value }
                  })}
                  className="w-full p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm"
                >
                  <option value="easy">{cur.easy}</option>
                  <option value="medium">{cur.medium}</option>
                  <option value="hard">{cur.hard}</option>
                </select>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                  {cur.total}
                </div>
                <input
                  type="number"
                  min={1}
                  value={local.tests.total}
                  onChange={(e) => setLocal({
                    ...local,
                    tests: { ...local.tests, total: Math.max(1, Number(e.target.value || 1)) }
                  })}
                  className="w-full p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm"
                />
              </div>

              {[
                ["includeAnswers", cur.includeAnswers],
                ["markdown", cur.markdown],
                ["shuffle", cur.shuffle],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm">
                  <input
                    type="checkbox"
                    checked={!!local.tests[key]}
                    onChange={(e) => setLocal({
                      ...local,
                      tests: { ...local.tests, [key]: e.target.checked }
                    })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>


          <div className="flex gap-4">
            <button
              onClick={reset}
              className="px-8 py-4 rounded-2xl border-2 border-black dark:border-white font-black uppercase text-[11px] tracking-widest"
            >
              {cur.reset}
            </button>
            <button
              onClick={save}
              className="px-8 py-4 rounded-2xl bg-blue-600 text-white border-2 border-black font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {cur.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const ProfilePage = ({ lang, user }) => {
  const cur = t[lang]?.prof || t.RU.prof;
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : {
      firstName: "John",
      lastName: "Doe",
      username: "@Guest",
      avatar: "https://moyashkola.gosuslugi.ru/netcat_files/9/67/avatar_0.png"
    };
  });

  const [tempData, setTempData] = useState(profileData);

  const handleSave = () => {
    setProfileData(tempData);
    localStorage.setItem('user_profile', JSON.stringify(tempData));
    setIsEditOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white p-10 font-sans">
      <div className="max-w-[1300px] mx-auto mb-10">
        <Link to="/hub" className="inline-flex items-center gap-2 font-black uppercase text-[10px] hover:text-blue-600 transition tracking-widest">
          <ChevronRight size={14} className="rotate-180" /> {cur.back}
        </Link>
      </div>

      <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-72 shrink-0">
          <div className="w-full aspect-square bg-slate-200 dark:bg-zinc-800 border-[4px] border-black dark:border-white rounded-xl overflow-hidden mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <img src={profileData.avatar} alt="avatar" className="w-full h-full object-cover grayscale" />
          </div>
          <div className="space-y-1 mb-6">
            <h1 className="text-3xl font-black tracking-tighter leading-tight">{profileData.firstName} {profileData.lastName}</h1>
            <p className="text-xl opacity-40 font-bold tracking-tight">{profileData.username}</p>
          </div>
          <button 
            onClick={() => { setTempData(profileData); setIsEditOpen(true); }}
            className="w-full py-3 bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {cur.edit}
          </button>
        </div>

        <div className="flex-1 w-full h-[500px] bg-white dark:bg-zinc-900/30 border-[4px] border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] flex items-center justify-center border-dashed opacity-60">
           <p className="font-black uppercase text-[10px] tracking-[0.4em] opacity-10 italic">{cur.empty}</p>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white p-10 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-black uppercase mb-8 tracking-tighter">{cur.edit}</h2>
            <div className="space-y-5">
              <input value={tempData.firstName} onChange={(e) => setTempData({...tempData, firstName: e.target.value})} placeholder="First Name" className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-2 border-black rounded-xl font-bold outline-none" />
              <input value={tempData.lastName} onChange={(e) => setTempData({...tempData, lastName: e.target.value})} placeholder="Last Name" className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-2 border-black rounded-xl font-bold outline-none" />
              <input value={tempData.username} onChange={(e) => setTempData({...tempData, username: e.target.value})} placeholder="Username" className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-2 border-black rounded-xl font-bold outline-none text-blue-600" />
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsEditOpen(false)} className="flex-1 py-4 border-2 border-black rounded-xl font-black uppercase text-xs">{cur.cancel}</button>
                <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white border-2 border-black rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{cur.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-16"><Footer /></div>
    </div>
  );
};

const LandingPage = ({ lang, setLang, setIsAuthOpen, user, setUser }) => {
  const cur = t[lang]?.lt || t.RU.lt;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!menuOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans overflow-x-hidden pt-[100px]">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-12 py-8 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="font-black text-3xl italic tracking-tighter flex items-center gap-3 text-blue-600">
          <GraduationCap size={40} /> LESSON.LAB
        </div>
        
        <div className="flex gap-10 items-center font-black uppercase text-[13px] tracking-wider">
          <LanguageSwitcher lang={lang} setLang={setLang} />

          {!user ? (
            <>
              <button onClick={() => setIsAuthOpen(true)} className="hover:text-blue-600 transition">
                {cur.login}
              </button>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-12 py-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95"
              >
                {cur.signup}
              </button>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-12 h-12 rounded-full overflow-hidden border-2 border-black/20 dark:border-white/20 bg-white/60 dark:bg-zinc-900/60 hover:scale-[1.03] transition"
                title="Account"
              >
                <img
                  src={localStorage.getItem('user_profile')
                    ? (JSON.parse(localStorage.getItem('user_profile'))?.avatar || "")
                    : "https://moyashkola.gosuslugi.ru/netcat_files/9/67/avatar_0.png"}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-white"
                >
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/hub"); }}
                    className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                  >
                    {t[lang].menu.hub}
                  </button>

                  <button
                    onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                    className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                  >
                    {t[lang].menu.dashboard}
                  </button>

                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await api.logout().catch(() => {});
                      setUser(null);
                      navigate("/");
                    }}
                    className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition"
                  >
                    {t[lang].menu.logout}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-10 py-32 text-center">
        <div className="inline-block px-5 py-2 mb-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-black tracking-[0.2em] uppercase border border-blue-100 dark:border-blue-800">
          ✨ AI-POWERED EDUCATION
        </div>
        <h1 className="text-8xl font-black uppercase tracking-tight mb-12 leading-[1.05] tracking-tighter">
          {cur.hero}
        </h1>
        <p className="text-2xl opacity-50 max-w-2xl mx-auto mb-20 font-medium leading-relaxed">
          {cur.sub}
        </p>
        
        <button onClick={() => setIsAuthOpen(true)} className="group inline-flex items-center gap-6 px-16 py-8 bg-slate-900 dark:bg-white text-white dark:text-black text-xl font-bold uppercase tracking-widest rounded-[32px] hover:bg-blue-600 hover:text-white transition-all shadow-2xl">
          {cur.join} <ChevronRight size={28} />
        </button>
      </header>

      <Footer />
    </div>
  );
};

const Dashboard = ({ lang, setLang, user, setUser, dark, setDark, promptConfig }) => {
  const [form, setForm] = useState({ subject: "", topic: "", details: "", grade: "5", duration: "45" });
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const cur = t[lang] || t.RU;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api.generations.list(50);
        if (!alive) return;

        const items = data?.items || [];
        setHistory(items.map(x => ({
          id: x.id,
          name: x.topic || `#${x.id}`,
          status: x.status,
          created_at: x.created_at,
        })));

        // опционально: автоселект первого

        if (items[0]?.id) {
        setActiveId(items[0].id);
        try {
          const r = await api.generations.get(items[0].id);
          const it = r?.item || r;
          setRes(it?.result_md || it?.result || it?.prompt || "");
        } catch (e) {
          console.error("autoselect load failed", e);
        }
      }

      } catch (e) {
        console.error("history load failed", e);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleGenerate = async () => {
    if (!form.subject || !form.topic) return;

    const vars = {
      lang,
      subject: form.subject,
      topic: form.topic,
      grade: form.grade,
      duration: form.duration,
      details: form.details,
    };

    setLoading(true);
    setRes("");

    const promptText = buildPrompt("lesson_plan", vars, promptConfig);

    let generationId = null;

    try {
      const gen = await api.generations.create({
        subject: form.subject,
        topic: form.topic,
        details: form.details,
        grade: form.grade,
        duration: form.duration,
        lang,
        prompt: promptText,
        status: "running", // если бэк не принимает — убери
      });

      generationId = gen?.id;
      if (!generationId) throw new Error("No generationId returned from create()");

      setActiveId(generationId);

      // чтобы не плодить дубли — добавляем только если id ещё нет
      setHistory((prev) => {
        if (prev.some((x) => x.id === generationId)) return prev;
        return [{ id: generationId, name: form.topic, status: "running" }, ...prev];
      });

      const API_KEY = "AIzaSyBZ61oYbz9VadlP0vsUgGjM7VDZhsM7Fg0";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${API_KEY}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      });

      if (!response.ok) {
        let msg = "Ошибка API";
        try {
          const errorData = await response.json();
          msg = errorData?.error?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      if (!response.body) {
        const txt = await response.text().catch(() => "");
        throw new Error(txt || "Streaming response.body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.includes('"text":')) continue;

          const match = line.match(/"text":\s*"(.*)"/);
          if (!match?.[1]) continue;

          const cleanChunk = match[1]
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .replace(/\\t/g, "\t");

          accumulatedText += cleanChunk;
          setRes(accumulatedText);
        }
      }

      await api.generations.update(generationId, {
        status: "done",
        result_md: accumulatedText,
      });

      setHistory((prev) =>
        prev.map((x) => (x.id === generationId ? { ...x, status: "done", name: form.topic } : x))
      );
    } catch (error) {
      console.error("Ошибка генерации:", error);

      const message = String(error?.message || "");
      const msg = message.includes("429")
        ? "Лимиты исчерпаны. Подождите 60 секунд."
        : message || "Unknown error";

      setRes(`## Ошибка\n${msg}`);

      if (generationId) {
        try {
          await api.generations.update(generationId, {
            status: "error",
            error: String(error?.message || error),
          });
        } catch (e) {
          console.error("failed to save error", e);
        }

        setHistory((prev) =>
          prev.map((x) => (x.id === generationId ? { ...x, status: "error" } : x))
        );
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-zinc-100 font-sans p-6 gap-6 relative overflow-hidden">
      <aside className="w-80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl rounded-[40px] border border-white/20 flex flex-col shadow-xl">
        <div className="p-10 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <Link to="/hub" className="font-black text-xl italic tracking-tighter text-blue-600">
              LESSON.LAB
            </Link>
            <button onClick={() => setDark(!dark)} className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm transition-all hover:scale-110">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="text-[10px] font-black opacity-30 mb-8 tracking-[0.3em] uppercase">{cur.h}</div>
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={async () => {
                  try {
                    setActiveId(item.id);
                    const r = await api.generations.get(item.id);
                    const it = r?.item || r;
                    setRes(it?.result_md || it?.result || it?.prompt || "");
                    setActiveMenu(null);
                  } catch (e) {
                    console.error("history item load failed", e);
                  }
                }}
                className={`group relative p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/40 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer ${
                  activeId === item.id ? "ring-4 ring-blue-500/20" : ""
                }`}
              >
                {editingId === item.id ? (
                  <input 
                    autoFocus 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)} 
                    onBlur={async () => {
                      try {
                        await api.generations.update(item.id, { topic: editValue });
                        setHistory(p => p.map(h => h.id === item.id ? { ...h, name: editValue } : h));
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setEditingId(null);
                      }
                    }} 
                    className="text-[13px] bg-transparent outline-none w-full font-bold" 
                  />
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold opacity-80 group-hover:opacity-100 truncate w-40">{item.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }} className="opacity-0 group-hover:opacity-100">
                      <MoreVertical size={16}/>
                    </button>
                  </div>
                )}
                {activeMenu === item.id && (
                  <div className="absolute right-4 top-14 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-black dark:text-white">
                    <button onClick={() => { setEditingId(item.id); setEditValue(item.name); setActiveMenu(null); }} className="flex items-center gap-3 w-full p-4 text-[10px] hover:bg-slate-50 dark:hover:bg-zinc-700 transition font-black uppercase">
                      <Edit3 size={14}/> {cur.edit}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await api.generations.remove(item.id);
                          setHistory(h => h.filter(i => i.id !== item.id));
                          if (activeId === item.id) {
                            setActiveId(null);
                            setRes("");
                          }
                        } catch (e) {
                          console.error("delete failed", e);
                        } finally {
                          setActiveMenu(null);
                        }
                      }}
                      className="flex items-center gap-3 w-full p-4 text-[10px] text-red-500 hover:bg-red-50 transition font-black uppercase"
                    >
                      <Trash2 size={14}/> {cur.del}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-10 border-t border-slate-100 dark:border-zinc-800">
          <button onClick={async () => { await api.logout().catch(()=>{}); setUser(null); }} className="flex items-center gap-3 w-full p-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16}/> {cur.exit}
          </button>
        </div>
      </aside>      
      <main className="flex-1 flex gap-6 overflow-hidden">
        <section className="w-[480px] p-12 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto">    
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <h2 className="text-[12px] font-black uppercase tracking-widest text-blue-600">{cur.p}</h2>
              <Link
                to="/prompts"
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all"
              >
                Prompts
              </Link>
            </div>
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </div>
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className="w-full p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm appearance-none cursor-pointer">
                {[...Array(11)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
              </select>
              <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm appearance-none cursor-pointer"><option>45</option><option>60</option><option>90</option></select>
            </div>
            <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder={cur.s} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-blue-500/10 transition-all" />
            <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder={cur.t} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-blue-500/10 transition-all" />
            <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} placeholder={cur.d} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold h-52 resize-none focus:ring-4 ring-blue-500/10 transition-all" />
            <button onClick={handleGenerate} disabled={loading || !form.subject || !form.topic} className={`w-full py-7 rounded-[28px] text-[15px] font-black uppercase tracking-[0.3em] transition-all border-[4px] border-black dark:border-white shadow-2xl ${!loading && form.subject && form.topic ? 'bg-blue-600 text-white hover:scale-[1.02] active:scale-95' : 'bg-slate-200 dark:bg-zinc-800 opacity-50 cursor-not-allowed'}`}>{loading ? "..." : cur.g}</button>
          </div>
        </section>
        <section className="flex-1 p-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto">
          <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed italic"><ReactMarkdown>{res || "..."}</ReactMarkdown></div>
        </section>
      </main>
    </div>
  );
};

const Protected = ({ authReady, user, children }) => {
  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  return user ? children : <Navigate to="/" replace />;
};

export default function App() {
  const location = useLocation();
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || "RU");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [promptConfig, setPromptConfig] = useState(DEFAULT_PROMPT_CONFIG);
  const [promptHydrated, setPromptHydrated] = useState(false);

  // Сохраняем язык в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    const saved = localStorage.getItem("app_lang");
    if (saved && saved !== lang) {
      setLang(saved);
    }
  }, [location.pathname]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "app_lang" && e.newValue && e.newValue !== lang) {
        setLang(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [lang]);

  useEffect(() => {
    if (!user?.id) return;
    if (!promptHydrated) return;

    const key = `app_prompt_config:${user.id}`;
    localStorage.setItem(key, JSON.stringify(promptConfig));
  }, [promptConfig, user, promptHydrated]);

  useEffect(() => {
    if (!user?.id) return;

    const key = `app_prompt_config:${user.id}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        setPromptConfig(JSON.parse(saved));
      } catch {
        setPromptConfig(DEFAULT_PROMPT_CONFIG);
      }
    } else {
      setPromptConfig(DEFAULT_PROMPT_CONFIG);
    }

    setPromptHydrated(true);
  }, [user]);

  useEffect(() => { 
    document.documentElement.classList.toggle('dark', dark); 
    localStorage.setItem('theme', dark ? 'dark' : 'light'); 
  }, [dark]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const r = await api.me();
        if (!alive) return;
        setUser(r?.user || null);
      } catch {
        if (!alive) return;
        setUser(null);
      } finally {
        if (!alive) return;
        setAuthReady(true);
      }
    })();

    return () => { alive = false; };
  }, []);

  return (
    <>
      <AuthModal 
        isOpen={isAuthOpen} 
        mode={authMode} 
        setMode={setAuthMode} 
        onClose={() => setIsAuthOpen(false)} 
        email={email} 
        setEmail={setEmail} 
        pass={pass} 
        setPass={setPass} 
        isFormValid={
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && pass.length >= 8
        } 
        setUser={setUser} 
        isEmailValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)} 
        showEmailError={showEmailError} 
        setShowEmailError={setShowEmailError} 
        lang={lang} 
      />

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              lang={lang}
              setLang={setLang}
              setIsAuthOpen={setIsAuthOpen}
              user={user}
              setUser={setUser}
            />
          }
        />

        <Route
          path="/hub"
          element={
            <Protected authReady={authReady} user={user}>
              <HubPage
                lang={lang}
                setLang={setLang}
                user={user}
                setUser={setUser}
              />
            </Protected>
          }
        />

        <Route
          path="/dashboard"
          element={
            <Protected authReady={authReady} user={user}>
              <Dashboard
                lang={lang}
                setLang={setLang}
                user={user}
                setUser={setUser}
                dark={dark}
                setDark={setDark}
                promptConfig={promptConfig}
              />
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <Protected authReady={authReady} user={user}>
              <ProfilePage lang={lang} user={user} />
            </Protected>
          }
        />

        <Route
          path="/prompts"
          element={
            <Protected authReady={authReady} user={user}>
              <PromptsPage
                lang={lang}
                promptConfig={promptConfig}
                setPromptConfig={setPromptConfig}
              />
            </Protected>
          }
        />

        <Route
          path="*"
          element={<Navigate to={user ? "/hub" : "/"} replace />}
        />
      </Routes>
    </>
  );
}