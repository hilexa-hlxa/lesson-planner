import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header"; // Новый импорт
import { I18N as t } from "../lib/i18n";

export default function LandingPage({ lang, setLang, setIsAuthOpen, setAuthMode, resetAuthFields, user, setUser }) {
  const cur = t[lang]?.lt || t.RU.lt;
  const navigate = useNavigate();

  const handleJoinClick = () => {
    if (user) {
      navigate("/hub");
    } else {
      resetAuthFields?.();
      setAuthMode?.("signup");
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans overflow-x-hidden pt-[100px]">
      
      {/* ИСПОЛЬЗУЕМ УНИВЕРСАЛЬНЫЙ ХЕДЕР */}
      <Header 
        lang={lang} 
        setLang={setLang} 
        user={user} 
        setUser={setUser} 
        isLanding={true} // Активируем кнопки Войти/Регистрация
        setIsAuthOpen={setIsAuthOpen}
        setAuthMode={setAuthMode}
        resetAuthFields={resetAuthFields}
      />

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
          onClick={handleJoinClick}
          className="group inline-flex items-center gap-6 px-16 py-8 bg-blue-600 text-white text-xl font-black uppercase tracking-widest rounded-[32px] border-[4px] border-black shadow-[10px_10px_0px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all active:scale-95"
        >
          {cur.join} <ChevronRight size={28} strokeWidth={3} />
        </button>
      </header>

      <Footer />
    </div>
  );
}