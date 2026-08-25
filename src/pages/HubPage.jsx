import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, FileText, ChevronRight, LayoutGrid, Gamepad2, Users, X, Sparkles, Flame } from "lucide-react";
import { I18N as t } from "../lib/i18n";
import Footer from "../components/Footer";
import Header from "../components/Header";
import api from "../api";

const ONBOARDING_KEY = "lp_onboarding_dismissed_v1";

const ONBOARDING = {
  RU: {
    badge: "Первый вход",
    title: (name) => `Добро пожаловать${name ? `, ${name}` : ""}!`,
    teacherBody: "Начните с самого полезного: сгенерируйте план урока. Введите предмет и тему — через минуту получите готовую структуру с целями, ходом урока и домашним заданием.",
    studentBody: "Здесь живут игры и тесты. Чтобы попасть в тест, нужен 4-значный код от учителя, а классы можно найти в разделе «Мои классы».",
    teacherCta: "Создать первый план",
    studentCta: "Открыть игротеку",
    dismiss: "Скрыть",
  },
  KZ: {
    badge: "Алғашқы кіру",
    title: (name) => `Қош келдіңіз${name ? `, ${name}` : ""}!`,
    teacherBody: "Ең пайдалысынан бастаңыз: сабақ жоспарын жасаңыз. Пән мен тақырыпты енгізіңіз — бір минуттан кейін мақсаттары, барысы және үй тапсырмасы бар дайын құрылым аласыз.",
    studentBody: "Мұнда ойындар мен тесттер бар. Тестке кіру үшін мұғалімнен 4 санды код керек, ал сыныптарды «Менің сыныптарым» бөлімінен табасыз.",
    teacherCta: "Алғашқы жоспарды жасау",
    studentCta: "Ойын хабын ашу",
    dismiss: "Жасыру",
  },
  EN: {
    badge: "First visit",
    title: (name) => `Welcome${name ? `, ${name}` : ""}!`,
    teacherBody: "Start with the most useful thing: generate a lesson plan. Enter a subject and topic — in a minute you'll have a full structure with goals, lesson flow and homework.",
    studentBody: "Games and quizzes live here. To join a quiz you need a 4-digit code from your teacher; your classes are under \"My classes\".",
    teacherCta: "Create your first plan",
    studentCta: "Open the game library",
    dismiss: "Dismiss",
  },
};

export default function HubPage({ lang, setLang, user, setUser, ...accessProps }) {
  const cur = t[lang]?.hub || t.RU.hub;
  const isStudent = user?.role === 'student';

  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) !== "true"
  );

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const ob = ONBOARDING[lang] || ONBOARDING.RU;

  const hubT = {
    RU: { teacher: "ДЛЯ УЧИТЕЛЕЙ", teacherDesc: "Создание и автоматизация уроков, AI помощник, планы", student: "ДЛЯ УЧЕНИКОВ", studentDesc: "Обучающие игры, тесты, награды и прогресс", denied: "ТОЛЬКО ДЛЯ УЧИТЕЛЕЙ", gamesTitle: "ИГРОТЕКА", classes: "МОИ КЛАССЫ", classesTeacherDesc: "Управление классами, ученики, история тестов", classesStudentDesc: "Ваши классы и заявки", streakLabel: "дней подряд", streakCta: "Пройти вызов дня" },
    KZ: { teacher: "МҰҒАЛІМДЕРГЕ", teacherDesc: "Сабақтарды құрастыру және автоматтандыру, AI көмекші", student: "ОҚУШЫЛАРҒА", studentDesc: "Оқу ойындары, тесттер, марапаттар", denied: "МҰҒАЛІМДЕРГЕ ҒАНА", gamesTitle: "ОЙЫН ХАБЫ", classes: "МЕНІҢ СЫНЫПТАРЫМ", classesTeacherDesc: "Сыныптарды басқару, оқушылар, тест тарихы", classesStudentDesc: "Сіздің сыныптарыңыз және өтініштер", streakLabel: "күн қатарынан", streakCta: "Күндік сынақты өту" },
    EN: { teacher: "FOR TEACHERS", teacherDesc: "Lesson planning, automation, AI assistant", student: "FOR STUDENTS", studentDesc: "Learning games, quizzes, rewards", denied: "TEACHERS ONLY", gamesTitle: "GAME LIBRARY", classes: "MY CLASSES", classesTeacherDesc: "Manage classes, students, quiz history", classesStudentDesc: "Your classes and applications", streakLabel: "day streak", streakCta: "Take today's challenge" }
  }[lang] || {};

  // Серия показывается только ученикам — Daily Streak Challenge их фича;
  // молча пропускаем ошибку, если запрос не удался, чиповка просто не появится
  const [streak, setStreak] = useState(null);
  useEffect(() => {
    if (!isStudent) return;
    api.streak.get().then(setStreak).catch(() => {});
  }, [isStudent]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px]">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-10 sm:py-16 lg:py-20 text-center">

        {/* ── ОНБОРДИНГ ПЕРВОГО ВХОДА ── */}
        {showOnboarding && (
          <div className="relative mb-10 sm:mb-14 text-left rounded-[28px] sm:rounded-[36px] border-[3px] border-black dark:border-white bg-white dark:bg-zinc-900 p-6 sm:p-9 shadow-[8px_8px_0px_0px_rgba(5,150,105,1)]">
            <button
              onClick={dismissOnboarding}
              aria-label={ob.dismiss}
              className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors opacity-40 hover:opacity-100"
            >
              <X size={18} />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} /> {ob.badge}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-3 pr-8">
              {ob.title(user?.first_name)}
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-[15px] max-w-2xl mb-6">
              {isStudent ? ob.studentBody : ob.teacherBody}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to={isStudent ? "/games" : "/dashboard"}
                onClick={dismissOnboarding}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl border-[3px] border-black font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                {isStudent ? ob.studentCta : ob.teacherCta} <ChevronRight size={14} strokeWidth={3} />
              </Link>
              <button
                onClick={dismissOnboarding}
                className="px-6 py-3 rounded-xl border-2 border-black/10 dark:border-white/10 font-black uppercase text-[11px] tracking-widest opacity-50 hover:opacity-100 transition-opacity"
              >
                {ob.dismiss}
              </button>
            </div>
          </div>
        )}

        {isStudent && streak && (
          <div className="flex justify-center mb-5">
            <Link
              to="/daily-challenge"
              title={hubT.streakCta}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-[3px] border-black dark:border-white bg-orange-100 dark:bg-orange-900/30 font-black text-orange-600 dark:text-orange-300 text-sm hover:-translate-y-0.5 transition-transform"
            >
              <Flame size={18} /> {streak.current_streak > 0 ? `${streak.current_streak} ${hubT.streakLabel}` : hubT.streakCta}
            </Link>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase mb-12 sm:mb-20 lg:mb-24 tracking-tighter italic break-words">{cur.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:h-[500px]">

          <Link to="/tools" className={`group relative p-8 sm:p-12 bg-white dark:bg-zinc-900 rounded-[32px] sm:rounded-[50px] border-[4px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex flex-col justify-between text-left h-full ${isStudent ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            <div>
              <div className="absolute -top-4 sm:-top-6 left-6 sm:left-10 px-4 sm:px-6 py-1.5 sm:py-2 bg-emerald-600 text-white font-black text-[10px] sm:text-xs rounded-full border-2 border-black uppercase tracking-widest">{isStudent ? hubT.denied : hubT.teacher}</div>
              <div className="flex justify-between items-start mb-6 sm:mb-10 text-emerald-600">
                <LayoutGrid className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={2.5} /><div className="bg-slate-100 dark:bg-zinc-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl"><FileText className="w-7 h-7 sm:w-8 sm:h-8" /></div>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase mb-3 sm:mb-4 tracking-tight">{cur.tools}</h2>
              <p className="text-slate-500 font-bold leading-relaxed max-w-[280px] text-sm sm:text-base">{hubT.teacherDesc}</p>
            </div>
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm uppercase tracking-[0.2em] text-emerald-600 group-hover:gap-4 transition-all italic mt-6 sm:mt-8">{cur.go} <ChevronRight size={20} strokeWidth={3} /></div>
          </Link>

          <Link to="/games" className="group relative p-8 sm:p-12 bg-slate-100 dark:bg-zinc-950 rounded-[32px] sm:rounded-[50px] border-[4px] border-black dark:border-zinc-700 shadow-[12px_12px_0px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex flex-col justify-between text-left h-full">
            <div>
              <div className="absolute -top-4 sm:-top-6 left-6 sm:left-10 px-4 sm:px-6 py-1.5 sm:py-2 bg-black dark:bg-white text-white dark:text-black font-black text-[10px] sm:text-xs rounded-full border-2 border-black uppercase tracking-widest">{hubT.student}</div>
              <div className="flex justify-between items-start mb-6 sm:mb-10 text-black dark:text-white">
                <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={2.5} /><div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl"><GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" /></div>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase mb-3 sm:mb-4 tracking-tight">{hubT.gamesTitle}</h2>
              <p className="text-slate-500 font-bold leading-relaxed max-w-[280px] text-sm sm:text-base">{hubT.studentDesc}</p>
            </div>
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm uppercase tracking-[0.2em] text-black dark:text-white group-hover:gap-4 transition-all italic mt-6 sm:mt-8">{cur.go} <ChevronRight size={20} strokeWidth={3} /></div>
          </Link>
        </div>

        <Link
          to={isStudent ? "/my-classes" : "/classes"}
          className="group mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-6 sm:px-10 py-6 sm:py-7 bg-white dark:bg-zinc-900 rounded-[24px] sm:rounded-[32px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all text-left"
        >
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className="p-3 sm:p-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl shrink-0">
              <Users className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">{hubT.classes}</h2>
              <p className="text-slate-500 font-bold mt-1 text-sm sm:text-base">{isStudent ? hubT.classesStudentDesc : hubT.classesTeacherDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-black text-xs sm:text-sm uppercase tracking-[0.2em] text-black dark:text-white group-hover:gap-4 transition-all italic shrink-0">
            {cur.go} <ChevronRight size={20} strokeWidth={3} />
          </div>
        </Link>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
