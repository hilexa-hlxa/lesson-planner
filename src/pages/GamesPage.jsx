import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Gamepad2, LetterText, Zap, Brain, LifeBuoy, Keyboard, LayoutGrid, Flag } from 'lucide-react';
import { tr } from "../lib/i18n";
import Header from "../components/Header";

const GamesPage = ({ lang, setLang, user, setUser, ...accessProps }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      
      {/* ХЕДЕР */}
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-black text-white dark:bg-white dark:text-black rounded-2xl">
                <Gamepad2 size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic break-words">
              {tr(lang, "hub.games").replace(" (Скоро)", "").replace(" (Soon)", "").replace(" (Жақында)", "")}
            </h1>
        </div>
        <p className="text-xl text-slate-500 font-bold mb-16 max-w-2xl ml-20">
           {lang === 'EN' ? "Your zone. Take quizzes and level up." : 
            lang === 'KZ' ? "Сіздің аймағыңыз. Тест тапсырып, деңгейіңізді көтеріңіз." : 
            "Твоя зона. Проходи тесты и поднимай уровень."}
        </p>

        {/* ГРИД СЕТКА */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. ВОЙТИ В ТЕСТ */}
          <Link 
            to="/join-test" 
            className="group bg-white dark:bg-zinc-900 p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between min-h-[280px] sm:h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
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

          {/* 2. WORDLE */}
          <Link
            to="/wordle"
            className="group bg-white dark:bg-zinc-900 p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between min-h-[280px] sm:h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <LetterText size={40} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Wordle" : lang === 'KZ' ? "Вордл" : "Вордл"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Guess the hidden word. Play solo or in class." :
                 lang === 'KZ' ? "Жасырын сөзді тап. Жалғыз немесе сыныппен ойна." :
                 "Угадай скрытое слово. Играй один или в классе."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-black text-white px-6 py-3 rounded-full">GO!</span>
            </div>
          </Link>

          {/* 3. MATH BATTLE */}
          <Link
            to="/math-battle"
            className="group bg-white dark:bg-zinc-900 p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between min-h-[280px] sm:h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-rose-500 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <Zap size={40} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Math Battle" : lang === 'KZ' ? "Сандар шайқасы" : "Битва Чисел"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Beat the clock solo, or duel your class by code." :
                 lang === 'KZ' ? "Жалғыз уақытпен жарыс, немесе сыныппен код арқылы дуэльде." :
                 "Обгони время в одиночку или устрой дуэль с классом по коду."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-black text-white px-6 py-3 rounded-full">GO!</span>
            </div>
          </Link>

          {/* 4. HANGMAN */}
          <Link
            to="/hangman"
            className="group bg-white dark:bg-zinc-900 p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between min-h-[280px] sm:h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-cyan-600 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <LifeBuoy size={40} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Hangman" : lang === 'KZ' ? "Дарға асу" : "Виселица"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Guess letters before the robot gets built." :
                 lang === 'KZ' ? "Робот жиналып бітпей тұрып әріптерді тап." :
                 "Угадай буквы, пока не собрался робот."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-black text-white px-6 py-3 rounded-full">GO!</span>
            </div>
          </Link>

          {/* 5. MEMORY MATCH */}
          <Link
            to="/memory-match"
            className="group bg-white dark:bg-zinc-900 p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between min-h-[280px] sm:h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-fuchsia-500 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <Brain size={40} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Memory Match" : lang === 'KZ' ? "Жад ойыны" : "Игра на Память"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Flip cards, find the two that match." :
                 lang === 'KZ' ? "Карталарды аш, бір-біріне сәйкес екеуін тап." :
                 "Открывай карточки, находи одинаковые пары."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-black text-white px-6 py-3 rounded-full">GO!</span>
            </div>
          </Link>

          {/* 6. WORD SPRINT */}
          <Link
            to="/word-sprint"
            className="group bg-white dark:bg-zinc-900 p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between min-h-[280px] sm:h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-sky-500 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <Keyboard size={40} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Word Sprint" : lang === 'KZ' ? "Сөз спринті" : "Спринт Слов"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Type the sentence as fast and accurately as you can." :
                 lang === 'KZ' ? "Сөйлемді мүмкіндігінше жылдам әрі дәл тер." :
                 "Напечатай предложение максимально быстро и точно."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-black text-white px-6 py-3 rounded-full">GO!</span>
            </div>
          </Link>

          {/* 7. SORT IT OUT */}
          <Link
            to="/sort-it-out"
            className="group bg-white dark:bg-zinc-900 p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between min-h-[280px] sm:h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-lime-600 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <LayoutGrid size={40} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Sort It Out" : lang === 'KZ' ? "Орнына қой" : "Разложи по Полочкам"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Pick a subject, then sort terms into the right category." :
                 lang === 'KZ' ? "Пәнді таңда да, терминдерді дұрыс санатқа орналастыр." :
                 "Выбери предмет и разложи термины по нужным категориям."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-black text-white px-6 py-3 rounded-full">GO!</span>
            </div>
          </Link>

          {/* 8. TRIVIA RACE */}
          <Link
            to="/trivia-race"
            className="group bg-white dark:bg-zinc-900 p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between min-h-[280px] sm:h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-amber-500 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <Flag size={40} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Trivia Race" : lang === 'KZ' ? "Білгірлер жарысы" : "Гонка Эрудитов"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Answer your class's Test questions to race your token forward." :
                 lang === 'KZ' ? "Сыныптың Тест сұрақтарына жауап беріп, фишкаңды алға жылжыт." :
                 "Отвечай на вопросы Теста класса и продвигай свою фишку вперёд."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-black text-white px-6 py-3 rounded-full">GO!</span>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
};

export default GamesPage;