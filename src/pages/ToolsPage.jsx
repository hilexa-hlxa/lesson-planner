import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileQuestion, Lightbulb, ClipboardList } from 'lucide-react';
import { tr } from "../lib/i18n";
import Header from "../components/Header";

// Принимаем все пропсы доступа из App.jsx через ...accessProps
const ToolsPage = ({ lang, setLang, user, setUser, ...accessProps }) => {
  
  // Создаем объект для удобной передачи в Хедер
  const headerProps = { lang, setLang, user, setUser, ...accessProps };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20 transition-colors">
      
      {/* Теперь Хедер функционален на 100% */}
      <Header {...headerProps} />

      <main className="max-w-6xl mx-auto px-10">
        <h1 className="text-6xl font-black uppercase mb-4 tracking-tighter italic">
            {tr(lang, "hub.tools")}
        </h1>
        <p className="text-xl text-slate-500 font-bold mb-16 max-w-2xl">
          {lang === 'EN' ? "Teacher control panel. Create content with AI." : 
           lang === 'KZ' ? "Мұғалімнің басқару тақтасы. AI көмегімен контент жасаңыз." : 
           "Панель управления учителя. Создавайте контент с помощью AI."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. План Урока (Твой оригинальный дизайн) */}
          <Link 
            to="/generate" 
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]"
          >
            <div>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <BookOpen size={32} className="text-blue-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                  {tr(lang, "doc.lessonPlan")}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "Generate lesson structure, goals, and materials in 1 minute." : 
                 lang === 'KZ' ? "Сабақ құрылымын, мақсаттарын және материалдарын 1 минутта жасаңыз." : 
                 "Генерация структуры урока, целей и материалов за 1 минуту."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">
                  {tr(lang, "hub.go")}
               </span>
            </div>
          </Link>

          {/* 2. AI Тесты (Твой оригинальный дизайн) */}
          <Link 
            to="/create-test" 
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#a855f7] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]"
          >
            <div>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <FileQuestion size={32} className="text-purple-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                 AI {tr(lang, "doc.test")}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "Create quizzes manually or automatically by topic." : 
                 lang === 'KZ' ? "Тақырып бойынша тесттерді қолмен немесе автоматты түрде жасаңыз." : 
                 "Создание квизов вручную или автоматически по теме урока."}
              </p>
            </div>
             <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">
                   {tr(lang, "hub.go")}
               </span>
            </div>
          </Link>

          {/* 3. Итог урока */}
          <Link
            to="/lesson-summary"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(22,163,74,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]"
          >
            <div>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <ClipboardList size={32} className="text-green-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Lesson Summary" : lang === 'KZ' ? "Сабақ қорытындысы" : "Итог урока"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "AI writes what was covered, homework, and who needs support." :
                 lang === 'KZ' ? "AI нені өткенін, үй тапсырмасын және кімге көмек қажетін жазады." :
                 "AI пишет что прошли, домашнее задание и кому нужна помощь."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">
                   {tr(lang, "hub.go")}
               </span>
            </div>
          </Link>

          {/* 4. Генератор идей (Заглушка) */}
          <div className="border-[4px] border-dashed border-slate-300 dark:border-zinc-800 rounded-[40px] p-8 flex flex-col items-center justify-center text-slate-400 h-[320px] group cursor-not-allowed select-none">
            <Lightbulb size={48} className="mb-4 opacity-50 group-hover:text-yellow-500 transition-colors" />
            <span className="font-black uppercase text-lg tracking-widest opacity-60">
                {lang === 'EN' ? "Idea Generator" : lang === 'KZ' ? "Идея генераторы" : "Генератор идей"}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest bg-slate-200 dark:bg-zinc-800 px-3 py-1 rounded-full mt-4">
                {lang === 'EN' ? "Soon" : lang === 'KZ' ? "Жақында" : "Скоро"}
            </span>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ToolsPage;