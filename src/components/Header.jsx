import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, User, LogOut, Sun, 
  Moon, Type, Contrast 
} from 'lucide-react';

import api from "../api";
import { invalidate, invalidatePrefixRaw } from "../apiCache";
import LanguageSwitcher from "./LanguageSwitcher";
import { I18N as t } from "../lib/i18n";

export default function Header({
  lang, setLang, user, setUser,
  dark, setDark, fontSize, setFontSize, highContrast, setHighContrast,
  showProfile = true, isLanding = false, announcementBar = false,
  setIsAuthOpen, setAuthMode, resetAuthFields
}) {
  const navigate = useNavigate();
  const location = useLocation(); // Следим за текущим путем
  const curAuth = t[lang]?.lt || t.RU.lt;

  // ЛОГИКА "УМНОГО" ЛОГОТИПА
  // 1. Если гость — всегда на лендинг (/)
  // 2. Если залогинен и на Хабе — на лендинг (/)
  // 3. Если залогинен и НЕ на Хабе — на Хаб (/hub)
  const logoTarget = (!user || location.pathname === "/hub") ? "/" : "/hub";

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    invalidate("me");
    invalidatePrefixRaw("generations.");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className={`fixed ${announcementBar ? 'top-9' : 'top-0'} left-0 right-0 z-[100] flex justify-between items-center px-12 py-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 transition-all`}>
      
      {/* 1. ЛОГОТИП С УМНОЙ НАВИГАЦИЕЙ */}
      <div className="flex-1 flex justify-start">
        <Link 
          to={logoTarget} 
          className="font-black text-2xl italic tracking-tighter flex items-center gap-3 text-emerald-600 hover:opacity-80 transition-opacity"
        >
          <GraduationCap size={32} /> LESSON.LAB
        </Link>
      </div>

      {/* 2. ПАНЕЛЬ ДОСТУПНОСТИ */}
      <div className="flex-1 flex justify-center items-center gap-4">
        {(user || !isLanding) && (
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 dark:bg-zinc-800/50 rounded-2xl border border-black/5 dark:border-white/5 shadow-inner">
            <button 
              onClick={() => setDark(!dark)} 
              className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-xl transition-all shadow-sm"
            >
              {dark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-emerald-600" />}
            </button>
            
            <button 
              onClick={() => setHighContrast(!highContrast)} 
              className={`p-2 rounded-xl transition-all shadow-sm ${highContrast ? "bg-black text-white" : "hover:bg-white dark:hover:bg-zinc-700"}`}
            >
              <Contrast size={18} />
            </button>

            <div className="flex items-center gap-1 px-2 border-l border-black/10">
              <Type size={14} className="opacity-40" />
              <select 
                value={fontSize} 
                onChange={(e) => setFontSize(e.target.value)} 
                className="bg-transparent font-black text-[11px] uppercase outline-none cursor-pointer dark:text-white"
              >
                <option value="md">A</option>
                <option value="lg">A+</option>
                <option value="xl">A++</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. АККАУНТ И ЯЗЫК */}
      <div className="flex-1 flex justify-end items-center gap-6">
        <LanguageSwitcher lang={lang} setLang={setLang} />

        {user ? (
          <div className="flex items-center gap-4">
            {showProfile && (
              <Link to="/profile" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 rounded-xl border-2 border-black/10 hover:border-black transition-all shadow-sm">
                <User size={18} />
                <span className="font-black uppercase text-[10px] tracking-widest">{user?.first_name || "Account"}</span>
              </Link>
            )}
            <button onClick={handleLogout} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition">
              <LogOut size={22} />
            </button>
          </div>
        ) : isLanding && (
          <div className="flex gap-4 items-center">
            <button onClick={() => { resetAuthFields?.(); setAuthMode?.("login"); setIsAuthOpen(true); }} className="font-black uppercase text-[12px] tracking-widest hover:text-emerald-600 transition">
              {curAuth.login}
            </button>
            <button onClick={() => { resetAuthFields?.(); setAuthMode?.("signup"); setIsAuthOpen(true); }} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[11px] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none transition-all">
              {curAuth.signup}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}