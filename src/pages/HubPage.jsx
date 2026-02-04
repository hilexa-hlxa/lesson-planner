import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, FileText, ChevronRight, User, LayoutGrid, Gamepad2, LogOut, PlusSquare, Play } from "lucide-react";
import api from "../api";
import { invalidate, invalidatePrefixRaw } from "../apiCache";
import { I18N as t } from "../lib/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Footer from "../components/Footer";

export default function HubPage({ lang, setLang, user, setUser }) {
  const cur = t[lang]?.hub || t.RU.hub;
  const navigate = useNavigate();

  const content = {
    RU: {
      teacher: "ДЛЯ УЧИТЕЛЕЙ",
      teacherDesc: "Создание и автоматизация уроков, AI помощник, планы",
      btnQuiz: "Создать AI Тест",
      student: "ДЛЯ УЧЕНИКОВ",
      studentDesc: "Обучающие игры, награды, прогресс (Скоро)",
      btnJoin: "Войти в Тест",
    },
    KZ: {
      teacher: "МҰҒАЛІМДЕРГЕ",
      teacherDesc: "Сабақтарды құрастыру және автоматтандыру, AI көмекші",
      btnQuiz: "Тест құру",
      student: "ОҚУШЫЛАРҒА",
      studentDesc: "Оқу ойындары, марапаттар, прогресс (Жақында)",
      btnJoin: "Тестке кіру",
    },
    EN: {
      teacher: "FOR TEACHERS",
      teacherDesc: "Lesson planning, automation, AI assistant",
      btnQuiz: "Create AI Quiz",
      student: "FOR STUDENTS",
      studentDesc: "Learning games, rewards, student progress (Soon)",
      btnJoin: "Join Quiz",
    },
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
          <Link
            to="/profile"
            className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border-2 border-black/10 hover:border-black"
          >
            <User size={20} />
            <span className="font-black uppercase text-[11px] tracking-widest">Account</span>
          </Link>
          <button
            onClick={async () => {
              await api.logout().catch(() => {});
              invalidate("me");
              invalidatePrefixRaw("generations.");
              setUser(null);
              navigate("/");
            }}
            className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition"
          >
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-10 py-20 text-center">
        <h1 className="text-7xl font-black uppercase mb-24 tracking-tighter italic">{cur.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* === КОЛОНКА УЧИТЕЛЯ === */}
          <div className="flex flex-col gap-4">
            {/* Старая большая карта (Инструменты) */}
            <Link
              to="/dashboard"
              className="group relative p-12 bg-white dark:bg-zinc-900 rounded-[50px] border-[4px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex-1 text-left"
            >
              <div className="absolute -top-6 left-10 px-6 py-2 bg-blue-600 text-white font-black text-xs rounded-full border-2 border-black uppercase tracking-widest">
                {hubT.teacher}
              </div>
              <div className="flex justify-between items-start mb-10 text-blue-600">
                <LayoutGrid size={64} strokeWidth={2.5} />
                <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-3xl">
                  <FileText size={32} />
                </div>
              </div>
              <h2 className="text-4xl font-black uppercase mb-4 tracking-tight">{cur.tools}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8 max-w-[280px]">
                {hubT.teacherDesc}
              </p>
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-[0.2em] text-blue-600 group-hover:gap-4 transition-all italic">
                {cur.go} <ChevronRight size={20} strokeWidth={3} />
              </div>
            </Link>

            {/* НОВАЯ КНОПКА: Создать Тест */}
            <Link 
              to="/create-test"
              className="bg-blue-600 text-white p-6 rounded-[30px] border-[4px] border-black shadow-[8px_8px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-between group"
            >
               <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl"><PlusSquare size={24} /></div>
                  <span className="font-black uppercase text-xl tracking-tight">{hubT.btnQuiz}</span>
               </div>
               <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {/* === КОЛОНКА УЧЕНИКА === */}
          <div className="flex flex-col gap-4">
            {/* Старая большая карта (Игротека - неактивная) */}
            <div className="relative p-12 bg-slate-100 dark:bg-zinc-950 rounded-[50px] border-[4px] border-dashed border-slate-300 dark:border-zinc-800 opacity-60 flex-1 text-left">
              <div className="absolute -top-6 left-10 px-6 py-2 bg-slate-300 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 font-black text-xs rounded-full border-2 border-dashed border-slate-400 uppercase tracking-widest">
                {hubT.student}
              </div>
              <div className="flex justify-between items-start mb-10 text-slate-400">
                <Gamepad2 size={64} strokeWidth={2.5} />
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl">
                  <GraduationCap size={32} />
                </div>
              </div>
              <h2 className="text-4xl font-black uppercase mb-4 tracking-tight opacity-50">{cur.games}</h2>
              <p className="text-slate-400 font-bold leading-relaxed mb-8 max-w-[280px]">{hubT.studentDesc}</p>
            </div>

            {/* НОВАЯ КНОПКА: Войти в Тест */}
            <Link 
              to="/join-test"
              className="bg-black text-white dark:bg-white dark:text-black p-6 rounded-[30px] border-[4px] border-transparent hover:scale-[1.02] transition-all flex items-center justify-between group shadow-xl"
            >
               <div className="flex items-center gap-4">
                  <div className="bg-white/20 dark:bg-black/10 p-3 rounded-2xl"><Play size={24} fill="currentColor" /></div>
                  <span className="font-black uppercase text-xl tracking-tight">{hubT.btnJoin}</span>
               </div>
               <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}