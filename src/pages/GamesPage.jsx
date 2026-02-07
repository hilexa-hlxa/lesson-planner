import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Lock, Gamepad2 } from 'lucide-react';
import { tr } from "../lib/i18n";
import Header from "../components/Header";

const GamesPage = ({ lang, setLang, user, setUser }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">
      
      {/* ХЕДЕР */}
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} />

      <main className="max-w-6xl mx-auto px-10">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-black text-white dark:bg-white dark:text-black rounded-2xl">
                <Gamepad2 size={32} />
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter italic">
              {tr(lang, "hub.games").replace(" (Скоро)", "").replace(" (Soon)", "").replace(" (Жақында)", "")}
            </h1>
        </div>
        <p className="text-xl text-slate-500 font-bold mb-16 max-w-2xl ml-20">
           {lang === 'EN' ? "Your zone. Take quizzes and level up." : 
            lang === 'KZ' ? "Сіздің аймағыңыз. Тест тапсырып, деңгейіңізді көтеріңіз." : 
            "Твоя зона. Проходи тесты и поднимай уровень."}
        </p>

        {/* ГРИД СЕТКА */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. ВОЙТИ В ТЕСТ */}
          <Link 
            to="/join-test" 
            className="group bg-white dark:bg-zinc-900 p-10 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <Play size={40} fill="currentColor" />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Join Quiz" : lang === 'KZ' ? "Тестке кіру" : "Войти в Тест"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Enter teacher's code to start." : 
                 lang === 'KZ' ? "Бастау үшін мұғалімнің кодын енгізіңіз." : 
                 "Введи код учителя, чтобы начать соревнование."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-black text-white px-6 py-3 rounded-full">GO!</span>
            </div>
          </Link>

          {/* 2. ЗАГЛУШКА */}
          <div className="border-[4px] border-dashed border-slate-300 dark:border-zinc-800 rounded-[40px] p-10 flex flex-col items-center justify-center text-slate-400 h-[360px] cursor-not-allowed select-none">
            <Lock size={64} className="mb-6 opacity-30" />
            <span className="font-black uppercase text-2xl tracking-widest opacity-50">Math Battle</span>
            <div className="mt-4 px-4 py-1 bg-slate-200 dark:bg-zinc-800 rounded-full text-xs font-black uppercase tracking-widest">
                {lang === 'EN' ? "Soon" : lang === 'KZ' ? "Жақында" : "Скоро"}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default GamesPage;