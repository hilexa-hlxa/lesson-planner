import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function NotFoundPage({ user }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex flex-col items-center justify-center text-center px-8">
      <Link to="/" className="flex items-center gap-2 font-black text-xl italic tracking-tighter text-emerald-600 mb-16">
        <GraduationCap size={26} /> LESSON.LAB
      </Link>

      <div className="text-[120px] md:text-[180px] font-black leading-none text-slate-900 dark:text-white tracking-tighter opacity-10 select-none">
        404
      </div>

      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mt-6 mb-4 text-slate-900 dark:text-white">
        Страница не найдена
      </h1>
      <p className="text-slate-400 mb-10 max-w-sm leading-relaxed">
        Такой страницы не существует. Возможно, ссылка устарела или была удалена.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl border-[2px] border-black dark:border-white font-black uppercase text-[11px] tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
        >
          ← Назад
        </button>
        <Link
          to={user ? "/hub" : "/"}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl border-[2px] border-black font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          {user ? "На хаб" : "На главную"}
        </Link>
      </div>
    </div>
  );
}
