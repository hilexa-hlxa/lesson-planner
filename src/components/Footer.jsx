import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">

          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 font-black text-lg italic tracking-tighter text-emerald-600">
              <GraduationCap size={22} /> LESSON.LAB
            </Link>
            <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
              AI-платформа для учителей Казахстана.
            </p>
          </div>

          <div className="flex gap-12 text-[11px] font-black uppercase tracking-widest">
            <div className="flex flex-col gap-3">
              <span className="opacity-30 mb-1">Платформа</span>
              <Link to="/hub" className="opacity-50 hover:opacity-100 transition-opacity">Хаб</Link>
              <Link to="/tools" className="opacity-50 hover:opacity-100 transition-opacity">Инструменты</Link>
              <Link to="/games" className="opacity-50 hover:opacity-100 transition-opacity">Игры</Link>
              <Link to="/classes" className="opacity-50 hover:opacity-100 transition-opacity">Классы</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="opacity-30 mb-1">Аккаунт</span>
              <Link to="/profile" className="opacity-50 hover:opacity-100 transition-opacity">Профиль</Link>
              <Link to="/join-test" className="opacity-50 hover:opacity-100 transition-opacity">Войти в тест</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 opacity-30 text-[10px] font-black uppercase tracking-[0.2em]">
          <span>© 2026 LESSON.LAB — All rights reserved</span>
          <span>Made for Kazakhstan teachers</span>
        </div>
      </div>
    </footer>
  );
}
