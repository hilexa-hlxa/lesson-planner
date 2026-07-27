import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, FileText, ChevronRight, LayoutGrid, Gamepad2, Users } from "lucide-react";
import { I18N as t } from "../lib/i18n";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function HubPage({ lang, setLang, user, setUser, ...accessProps }) {
  const cur = t[lang]?.hub || t.RU.hub;
  const isStudent = user?.role === 'student';

  const hubT = {
    RU: { teacher: "ДЛЯ УЧИТЕЛЕЙ", teacherDesc: "Создание и автоматизация уроков, AI помощник, планы", student: "ДЛЯ УЧЕНИКОВ", studentDesc: "Обучающие игры, тесты, награды и прогресс", denied: "ТОЛЬКО ДЛЯ УЧИТЕЛЕЙ", gamesTitle: "ИГРОТЕКА", classes: "МОИ КЛАССЫ", classesTeacherDesc: "Управление классами, ученики, история тестов", classesStudentDesc: "Ваши классы и заявки" },
    KZ: { teacher: "МҰҒАЛІМДЕРГЕ", teacherDesc: "Сабақтарды құрастыру және автоматтандыру, AI көмекші", student: "ОҚУШЫЛАРҒА", studentDesc: "Оқу ойындары, тесттер, марапаттар", denied: "МҰҒАЛІМДЕРГЕ ҒАНА", gamesTitle: "ОЙЫН ХАБЫ", classes: "МЕНІҢ СЫНЫПТАРЫМ", classesTeacherDesc: "Сыныптарды басқару, оқушылар, тест тарихы", classesStudentDesc: "Сіздің сыныптарыңыз және өтініштер" },
    EN: { teacher: "FOR TEACHERS", teacherDesc: "Lesson planning, automation, AI assistant", student: "FOR STUDENTS", studentDesc: "Learning games, quizzes, rewards", denied: "TEACHERS ONLY", gamesTitle: "GAME LIBRARY", classes: "MY CLASSES", classesTeacherDesc: "Manage classes, students, quiz history", classesStudentDesc: "Your classes and applications" }
  }[lang] || {};

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px]">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-6xl mx-auto px-10 py-20 text-center">
        <h1 className="text-7xl font-black uppercase mb-24 tracking-tighter italic">{cur.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
          
          <Link to="/tools" className={`group relative p-12 bg-white dark:bg-zinc-900 rounded-[50px] border-[4px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex flex-col justify-between text-left h-full ${isStudent ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            <div>
              <div className="absolute -top-6 left-10 px-6 py-2 bg-emerald-600 text-white font-black text-xs rounded-full border-2 border-black uppercase tracking-widest">{isStudent ? hubT.denied : hubT.teacher}</div>
              <div className="flex justify-between items-start mb-10 text-emerald-600">
                <LayoutGrid size={64} strokeWidth={2.5} /><div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-3xl"><FileText size={32} /></div>
              </div>
              <h2 className="text-4xl font-black uppercase mb-4 tracking-tight">{cur.tools}</h2>
              <p className="text-slate-500 font-bold leading-relaxed max-w-[280px]">{hubT.teacherDesc}</p>
            </div>
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-[0.2em] text-emerald-600 group-hover:gap-4 transition-all italic mt-8">{cur.go} <ChevronRight size={20} strokeWidth={3} /></div>
          </Link>

          <Link to="/games" className="group relative p-12 bg-slate-100 dark:bg-zinc-950 rounded-[50px] border-[4px] border-black dark:border-zinc-700 shadow-[12px_12px_0px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex flex-col justify-between text-left h-full">
            <div>
              <div className="absolute -top-6 left-10 px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-black text-xs rounded-full border-2 border-black uppercase tracking-widest">{hubT.student}</div>
              <div className="flex justify-between items-start mb-10 text-black dark:text-white">
                <Gamepad2 size={64} strokeWidth={2.5} /><div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl"><GraduationCap size={32} /></div>
              </div>
              <h2 className="text-4xl font-black uppercase mb-4 tracking-tight">{hubT.gamesTitle}</h2>
              <p className="text-slate-500 font-bold leading-relaxed max-w-[280px]">{hubT.studentDesc}</p>
            </div>
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-[0.2em] text-black dark:text-white group-hover:gap-4 transition-all italic mt-8">{cur.go} <ChevronRight size={20} strokeWidth={3} /></div>
          </Link>
        </div>

        <Link
          to={isStudent ? "/my-classes" : "/classes"}
          className="group mt-8 flex items-center justify-between px-10 py-7 bg-white dark:bg-zinc-900 rounded-[32px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all text-left"
        >
          <div className="flex items-center gap-6">
            <div className="p-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl shrink-0">
              <Users size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">{hubT.classes}</h2>
              <p className="text-slate-500 font-bold mt-1">{isStudent ? hubT.classesStudentDesc : hubT.classesTeacherDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-black text-sm uppercase tracking-[0.2em] text-black dark:text-white group-hover:gap-4 transition-all italic shrink-0">
            {cur.go} <ChevronRight size={20} strokeWidth={3} />
          </div>
        </Link>
      </main>
      <Footer />
    </div>
  );
}