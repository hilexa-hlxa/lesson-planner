import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap, User, LogOut, Sun,
  Moon, Type, Contrast, Settings2
} from 'lucide-react';

import api from "../api";
import { invalidate, invalidatePrefixRaw } from "../apiCache";
import LanguageSwitcher from "./LanguageSwitcher";
import { I18N as t } from "../lib/i18n";

// Панель доступности — используется и в десктопной строке, и в мобильном меню
function AccessibilityPanel({ dark, setDark, highContrast, setHighContrast, fontSize, setFontSize, stacked = false }) {
  return (
    <div className={`flex items-center gap-2 p-1.5 bg-slate-100/50 dark:bg-zinc-800/50 rounded-2xl border border-black/5 dark:border-white/5 shadow-inner ${stacked ? 'w-full justify-between' : ''}`}>
      <button
        onClick={() => setDark(!dark)}
        aria-label="Toggle dark mode"
        className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-xl transition-all shadow-sm"
      >
        {dark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-emerald-600" />}
      </button>

      <button
        onClick={() => setHighContrast(!highContrast)}
        aria-label="Toggle high contrast"
        className={`p-2 rounded-xl transition-all shadow-sm ${highContrast ? "bg-black text-white" : "hover:bg-white dark:hover:bg-zinc-700"}`}
      >
        <Contrast size={18} />
      </button>

      <div className="flex items-center gap-1 px-2 border-l border-black/10">
        <Type size={14} className="opacity-40" />
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          aria-label="Font size"
          className="bg-transparent font-black text-[11px] uppercase outline-none cursor-pointer dark:text-white focus:ring-2 focus:ring-emerald-500/40"
        >
          <option value="md">A</option>
          <option value="lg">A+</option>
          <option value="xl">A++</option>
        </select>
      </div>
    </div>
  );
}

export default function Header({
  lang, setLang, user, setUser,
  dark, setDark, fontSize, setFontSize, highContrast, setHighContrast,
  showProfile = true, isLanding = false, announcementBar = false,
  setIsAuthOpen, setAuthMode, resetAuthFields
}) {
  const navigate = useNavigate();
  const location = useLocation(); // Следим за текущим путем
  const curAuth = t[lang]?.lt || t.RU.lt;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Закрываем мобильное меню при клике вне него или по Esc — второе нужно
  // клавиатурным пользователям, у которых нет "клика вне" как способа выйти.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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

  const showAccessibility = user || !isLanding;
  const a11yProps = { dark, setDark, highContrast, setHighContrast, fontSize, setFontSize };

  return (
    <nav className={`fixed ${announcementBar ? 'top-9' : 'top-0'} left-0 right-0 z-[100] flex justify-between items-center gap-3 px-4 sm:px-8 lg:px-12 py-4 lg:py-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 transition-all`}>

      {/* 1. ЛОГОТИП С УМНОЙ НАВИГАЦИЕЙ */}
      <div className="flex-1 min-w-0 flex justify-start">
        <Link
          to={logoTarget}
          className="font-black text-lg sm:text-xl lg:text-2xl italic tracking-tighter flex items-center gap-2 lg:gap-3 text-emerald-600 hover:opacity-80 transition-opacity truncate"
        >
          <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 shrink-0" /> LESSON.LAB
        </Link>
      </div>

      {/* 2. ПАНЕЛЬ ДОСТУПНОСТИ (десктоп) */}
      <div className="hidden lg:flex flex-1 justify-center items-center gap-4">
        {showAccessibility && <AccessibilityPanel {...a11yProps} />}
      </div>

      {/* 3. АККАУНТ И ЯЗЫК */}
      <div className="flex-1 min-w-0 flex justify-end items-center gap-2 sm:gap-4 lg:gap-6">
        <div className="hidden sm:block">
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </div>

        {/* Мобильное меню: язык + доступность.
            Гостю на лендинге показывать нечего кроме языка — прячем кнопку с sm. */}
        <div className={`relative ${showAccessibility ? "lg:hidden" : "sm:hidden"}`} ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Settings"
            aria-expanded={menuOpen}
            className="p-2.5 rounded-xl border-2 border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-all"
          >
            <Settings2 size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-[240px] p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-3">
              <div className="sm:hidden">
                <LanguageSwitcher lang={lang} setLang={setLang} />
              </div>
              {showAccessibility && <AccessibilityPanel {...a11yProps} stacked />}
            </div>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            {showProfile && (
              <Link to="/profile" className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-white dark:bg-zinc-800 rounded-xl border-2 border-black/10 hover:border-black transition-all shadow-sm">
                <User size={18} />
                <span className="hidden sm:inline font-black uppercase text-[10px] tracking-widest truncate max-w-[100px]">{user?.first_name || "Account"}</span>
              </Link>
            )}
            <button onClick={handleLogout} aria-label="Log out" className="p-2 sm:p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition shrink-0">
              <LogOut size={22} />
            </button>
          </div>
        ) : isLanding && (
          <div className="flex gap-2 sm:gap-4 items-center">
            <button onClick={() => { resetAuthFields?.(); setAuthMode?.("login"); setIsAuthOpen(true); }} className="hidden sm:block font-black uppercase text-[12px] tracking-widest hover:text-emerald-600 transition">
              {curAuth.login}
            </button>
            <button onClick={() => { resetAuthFields?.(); setAuthMode?.("signup"); setIsAuthOpen(true); }} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] sm:text-[11px] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none transition-all whitespace-nowrap">
              {curAuth.signup}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
