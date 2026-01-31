// src/pages/LandingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ChevronRight } from "lucide-react";

import api from "../api";
import { invalidate, invalidatePrefixRaw } from "../apiCache";

import LanguageSwitcher from "../components/LanguageSwitcher";
import Footer from "../components/Footer";

import { I18N as t } from "../lib/i18n";

export default function LandingPage({ lang, setLang, setIsAuthOpen, user, setUser }) {
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

  const avatar =
    (() => {
      try {
        const saved = localStorage.getItem("user_profile");
        if (saved) return JSON.parse(saved)?.avatar || "";
      } catch {}
      return "https://moyashkola.gosuslugi.ru/netcat_files/9/67/avatar_0.png";
    })();

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
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-white">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/hub");
                    }}
                    className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                  >
                    {(t[lang] || t.RU).menu.hub}
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/dashboard");
                    }}
                    className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                  >
                    {(t[lang] || t.RU).menu.dashboard}
                  </button>

                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await api.logout().catch(() => {});
                      invalidate("me");
                      invalidatePrefixRaw("generations.");
                      setUser(null);
                      navigate("/");
                    }}
                    className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition"
                  >
                    {(t[lang] || t.RU).menu.logout}
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

        <button
          onClick={() => setIsAuthOpen(true)}
          className="group inline-flex items-center gap-6 px-16 py-8 bg-slate-900 dark:bg-white text-white dark:text-black text-xl font-bold uppercase tracking-widest rounded-[32px] hover:bg-blue-600 hover:text-white transition-all shadow-2xl"
        >
          {cur.join} <ChevronRight size={28} />
        </button>
      </header>

      <Footer />
    </div>
  );
}
