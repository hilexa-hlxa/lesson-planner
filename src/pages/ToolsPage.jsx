import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileQuestion, Lightbulb, ClipboardList, RotateCw, Users, ListChecks, X, Repeat, MessageCircle, FileText, Layers, Table, Languages, Shuffle, LayoutGrid, ClipboardCheck, Layers3 } from 'lucide-react';
import { tr } from "../lib/i18n";
import Header from "../components/Header";
import FortuneWheel from "../components/FortuneWheel";
import api from "../api";
import useEscapeKey from "../hooks/useEscapeKey";

const WHEEL_T = {
  RU: {
    title: 'КОЛЕСО ФОРТУНЫ', desc: 'Выбери ученика для опроса или категорию для задания.',
    byClass: 'Из класса', byClassDesc: 'Крутит реальных учеников — правильный ответ можно наградить монетами.',
    custom: 'Свой список', customDesc: 'Впиши что угодно — темы, категории, номера вариантов.',
    pickClass: 'Выбери класс', noClasses: 'У тебя пока нет ни одного класса.',
    studentFallback: 'Ученик', close: 'Закрыть',
    awarded: 'Начислено 10 монет!', awardFailed: 'Не удалось начислить монеты.',
  },
  KZ: {
    title: 'СӘТТІЛІК ДӨҢГЕЛЕГІ', desc: 'Сұрау үшін оқушыны немесе тапсырма санатын таңда.',
    byClass: 'Сыныптан', byClassDesc: 'Нақты оқушыларды айналдырады — дұрыс жауапты монетамен марапаттауға болады.',
    custom: 'Өз тізімің', customDesc: 'Кез келгенін жаз — тақырыптар, санаттар, нұсқа нөмірлері.',
    pickClass: 'Сыныпты таңда', noClasses: 'Сенде әзірге бір де сынып жоқ.',
    studentFallback: 'Оқушы', close: 'Жабу',
    awarded: '10 монета есептелді!', awardFailed: 'Монета есептеу мүмкін болмады.',
  },
  EN: {
    title: 'SPIN & ANSWER', desc: 'Pick a student to call on, or spin a category for the next task.',
    byClass: 'From a class', byClassDesc: 'Spins real students — you can reward a correct answer with coins.',
    custom: 'Custom list', customDesc: 'Type anything — topics, categories, variant numbers.',
    pickClass: 'Pick a class', noClasses: "You don't have any classes yet.",
    studentFallback: 'Student', close: 'Close',
    awarded: '10 coins awarded!', awardFailed: 'Could not award coins.',
  },
};

// Принимаем все пропсы доступа из App.jsx через ...accessProps
const ToolsPage = ({ lang, setLang, user, setUser, grantAchievement, ...accessProps }) => {
  const wt = WHEEL_T[lang] || WHEEL_T.RU;

  // null | 'choose' | 'pickClass' | 'wheel-roster' | 'wheel-custom'
  const [wheelStep, setWheelStep] = useState(null);
  const [classes, setClasses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [awardMsg, setAwardMsg] = useState('');

  const openWheelChooser = () => setWheelStep('choose');
  const closeWheel = () => { setWheelStep(null); setParticipants([]); setAwardMsg(''); };

  useEscapeKey(wheelStep !== null, closeWheel);

  const chooseByClass = async () => {
    setWheelStep('pickClass');
    try {
      const r = await api.classes.list();
      setClasses(r.classes || r.items || []);
    } catch { /* показываем пустой список — не критично для этого экрана */ }
  };

  const pickClass = async (classId) => {
    try {
      const r = await api.classes.getMembers(classId, 'approved');
      // display_name бывает пустым — ученик мог ни разу не заходить в профиль,
      // чтобы его задать. Без фолбэка колесо получало name: undefined и падало
      // на name.length при расчёте размера шрифта сегмента.
      const members = (r.members || r.items || []).map((m) => {
        const id = m.student_id || m.id;
        const fullName = [m.first_name, m.last_name].filter(Boolean).join(' ');
        const name = m.display_name || fullName || m.email || `${wt.studentFallback} #${id}`;
        return { id, name };
      });
      setParticipants(members);
      setWheelStep('wheel-roster');
    } catch {
      setWheelStep('choose');
    }
  };

  const handleWheelWin = async ({ id }) => {
    if (!id) return; // custom-list spin — нечего награждать
    try {
      await api.coins.award(id);
      setAwardMsg(wt.awarded);
    } catch {
      setAwardMsg(wt.awardFailed);
    }
  };

  // Создаем объект для удобной передачи в Хедер
  const headerProps = { lang, setLang, user, setUser, grantAchievement, ...accessProps };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20 transition-colors">
      
      {/* Теперь Хедер функционален на 100% */}
      <Header {...headerProps} />

      <main className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase mb-4 tracking-tighter italic break-words">
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
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]"
          >
            <div>
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <BookOpen size={32} className="text-emerald-600" />
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

          {/* 4. Колесо Фортуны / Spin & Answer */}
          <button
            onClick={openWheelChooser}
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#f59e0b] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px] text-left"
          >
            <div>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <RotateCw size={32} className="text-amber-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">{wt.title}</h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">{wt.desc}</p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">
                {tr(lang, "hub.go")}
              </span>
            </div>
          </button>

          {/* 5. Повторение западающих тем */}
          <Link
            to="/reteach-planner"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#dc2626] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]"
          >
            <div>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <Repeat size={32} className="text-red-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Reteach Planner" : lang === 'KZ' ? "Қайта өту" : "Переповторение"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "Find the class's most-missed questions and get a targeted mini-lesson." :
                 lang === 'KZ' ? "Сынып ең көп қателескен сұрақтарды тауып, нақты қайталау жоспарын ал." :
                 "Найди вопросы, где класс чаще всего ошибался, и получи план повторения."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">
                   {tr(lang, "hub.go")}
               </span>
            </div>
          </Link>

          {/* 6. Сообщение родителю */}
          <Link
            to="/parent-message"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#0891b2] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]"
          >
            <div>
              <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <MessageCircle size={32} className="text-cyan-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Parent Message" : lang === 'KZ' ? "Ата-анаға хабарлама" : "Сообщение родителю"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "Draft a Kundelik-ready progress note from a student's real test history." :
                 lang === 'KZ' ? "Оқушының нақты тест тарихы негізінде Kundelik-ке дайын хабарлама жаса." :
                 "Составь готовое для Kundelik сообщение по реальной истории тестов ученика."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">
                   {tr(lang, "hub.go")}
               </span>
            </div>
          </Link>

          {/* 7. Рабочий лист */}
          <Link to="/worksheet-generator"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#4f46e5] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]">
            <div>
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <FileText size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Worksheet" : lang === 'KZ' ? "Жұмыс парағы" : "Рабочий лист"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "A printable practice sheet with an answer key, by topic." :
                 lang === 'KZ' ? "Тақырып бойынша жауап кілті бар басып шығаруға дайын парақ." :
                 "Печатный лист с заданиями и ключом ответов по теме."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">{tr(lang, "hub.go")}</span>
            </div>
          </Link>

          {/* 8. Разноуровневый лист */}
          <Link to="/differentiated-worksheet"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#7c3aed] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]">
            <div>
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <Layers size={32} className="text-violet-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Differentiated Sheet" : lang === 'KZ' ? "Деңгейлік парақ" : "Разноуровневый лист"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "Same topic, three difficulty tiers in one generation." :
                 lang === 'KZ' ? "Бір тақырып, бір генерацияда үш қиындық деңгейі." :
                 "Одна тема — сразу три уровня сложности за одну генерацию."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">{tr(lang, "hub.go")}</span>
            </div>
          </Link>

          {/* 9. Критерии оценивания */}
          <Link to="/rubric-builder"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#ea580c] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]">
            <div>
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <Table size={32} className="text-orange-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Rubric Builder" : lang === 'KZ' ? "Бағалау критерийлері" : "Критерии оценивания"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "AI drafts a criteria x performance-level grading rubric." :
                 lang === 'KZ' ? "AI критерийлер мен деңгейлері бар бағалау кестесін жасайды." :
                 "AI составляет таблицу критериев и уровней оценивания."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">{tr(lang, "hub.go")}</span>
            </div>
          </Link>

          {/* 10. Перевод материала */}
          <Link to="/translate-materials"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#0d9488] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]">
            <div>
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <Languages size={32} className="text-teal-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Translate Material" : lang === 'KZ' ? "Материалды аудару" : "Перевод материала"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "Re-render an existing Lesson Plan or Test in RU/KZ/EN." :
                 lang === 'KZ' ? "Бар сабақ жоспарын немесе Тестті RU/KZ/EN тілдеріне аудару." :
                 "Перерендери существующий план урока или Тест на RU/KZ/EN."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">{tr(lang, "hub.go")}</span>
            </div>
          </Link>

          {/* 11. Случайные группы */}
          <Link to="/random-grouping"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#16a34a] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]">
            <div>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <Shuffle size={32} className="text-green-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Random Grouping" : lang === 'KZ' ? "Кездейсоқ топтар" : "Случайные группы"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "Split the class roster into random pairs or trios." :
                 lang === 'KZ' ? "Сынып тізімін кездейсоқ жұптарға немесе үштіктерге бөл." :
                 "Раздели список класса на случайные пары или тройки."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">{tr(lang, "hub.go")}</span>
            </div>
          </Link>

          {/* 12. Рассадка класса */}
          <Link to="/seating-chart"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#0369a1] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]">
            <div>
              <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <LayoutGrid size={32} className="text-sky-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Seating Chart" : lang === 'KZ' ? "Сыныпты отырғызу" : "Рассадка класса"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "Random seating layout, with an optional 'keep apart' rule." :
                 lang === 'KZ' ? "Кездейсоқ отырғызу, қаласаңыз — 'бөлек отырсын' ережесімен." :
                 "Случайная рассадка, при желании — с правилом «рассадить отдельно»."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">{tr(lang, "hub.go")}</span>
            </div>
          </Link>

          {/* 13. Журнал поведения */}
          <Link to="/behavior-log"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#be123c] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]">
            <div>
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <ClipboardCheck size={32} className="text-rose-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Behavior Log" : lang === 'KZ' ? "Мінез-құлық журналы" : "Журнал поведения"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "Quick positive/negative notes per student, logged over time." :
                 lang === 'KZ' ? "Әр оқушыға жылдам оң/теріс жазба, уақыт бойынша сақталады." :
                 "Быстрые плюс/минус заметки по ученику, сохраняются со временем."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">{tr(lang, "hub.go")}</span>
            </div>
          </Link>

          {/* 14. Карточки для повторения */}
          <Link to="/flashcard-export"
            className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#ca8a04] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[320px]">
            <div>
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mb-6 border-2 border-black/10">
                <Layers3 size={32} className="text-yellow-600" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">
                {lang === 'EN' ? "Flashcards" : lang === 'KZ' ? "Қайталау карточкалары" : "Карточки для повторения"}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-tight">
                {lang === 'EN' ? "Turn an existing Test into flip flashcards or a study guide." :
                 lang === 'KZ' ? "Бар Тестті аударылатын карточкаларға немесе конспектіге айналдыр." :
                 "Преврати существующий Тест в карточки или конспект для повторения."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-xs tracking-widest bg-black text-white px-4 py-2 rounded-full">{tr(lang, "hub.go")}</span>
            </div>
          </Link>

          {/* 15. Генератор идей (Заглушка) */}
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

      {/* Шаг выбора: реальный класс или свободный список */}
      {wheelStep === 'choose' && (
        <div onClick={closeWheel} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100000] flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-8 max-w-md w-full relative">
            <button onClick={closeWheel} aria-label={wt.close} className="absolute top-5 right-5 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black uppercase mb-6">{wt.title}</h2>
            <div className="flex flex-col gap-3">
              <button onClick={chooseByClass}
                className="text-left p-5 rounded-2xl border-[3px] border-black dark:border-white flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800">
                <Users size={24} className="mt-1 text-amber-600" />
                <div>
                  <div className="font-black uppercase">{wt.byClass}</div>
                  <div className="text-sm text-slate-500 font-bold">{wt.byClassDesc}</div>
                </div>
              </button>
              <button onClick={() => setWheelStep('wheel-custom')}
                className="text-left p-5 rounded-2xl border-[3px] border-black dark:border-white flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800">
                <ListChecks size={24} className="mt-1 text-amber-600" />
                <div>
                  <div className="font-black uppercase">{wt.custom}</div>
                  <div className="text-sm text-slate-500 font-bold">{wt.customDesc}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Шаг выбора класса */}
      {wheelStep === 'pickClass' && (
        <div onClick={closeWheel} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100000] flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-8 max-w-md w-full relative">
            <button onClick={closeWheel} aria-label={wt.close} className="absolute top-5 right-5 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black uppercase mb-6">{wt.pickClass}</h2>
            {classes.length === 0 && <p className="text-slate-400 font-bold text-sm">{wt.noClasses}</p>}
            <div className="flex flex-col gap-2">
              {classes.map((c) => (
                <button key={c.id} onClick={() => pickClass(c.id)}
                  className="text-left px-4 py-3 rounded-xl border-[3px] border-black dark:border-white font-bold hover:bg-slate-100 dark:hover:bg-zinc-800">
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(wheelStep === 'wheel-roster' || wheelStep === 'wheel-custom') && (
        <FortuneWheel
          participants={wheelStep === 'wheel-roster' ? participants : undefined}
          onClose={closeWheel}
          onWin={handleWheelWin}
        />
      )}

      {awardMsg && (
        <div className="fixed bottom-6 right-6 z-[100001] bg-black text-white font-black px-6 py-4 rounded-2xl border-4 border-white shadow-2xl">
          {awardMsg}
        </div>
      )}
    </div>
  );
};

export default ToolsPage;