import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const T = {
  RU: {
    title: "Страница не найдена",
    body: "Такой страницы не существует. Возможно, ссылка устарела или была удалена.",
    back: "← Назад",
    hub: "На хаб",
    home: "На главную",
  },
  KZ: {
    title: "Бет табылмады",
    body: "Мұндай бет жоқ. Сілтеме ескірген немесе жойылған болуы мүмкін.",
    back: "← Артқа",
    hub: "Хабқа",
    home: "Басты бетке",
  },
  EN: {
    title: "Page not found",
    body: "This page doesn't exist. The link may be outdated or the page was removed.",
    back: "← Back",
    hub: "Go to hub",
    home: "Go home",
  },
};

export default function NotFoundPage({ user, lang = "RU" }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  // Render всегда отвечает 200 (SPA-фолбэк на index.html — см. routes в
  // render.yaml), так что без этого Google видел бы страницу-404 как обычный
  // 200-контент и мог бы проиндексировать битую ссылку как настоящую
  // страницу. Восстанавливаем index,follow при уходе — иначе значение
  // "прилипнет" и следующая реальная страница тоже перестанет индексироваться.
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    meta?.setAttribute("content", "noindex, follow");
    return () => { meta?.setAttribute("content", "index, follow"); };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex flex-col items-center justify-center text-center px-5 sm:px-8 py-16">
      <Link to="/" className="flex items-center gap-2 font-black text-lg sm:text-xl italic tracking-tighter text-emerald-600 mb-12 sm:mb-16">
        <GraduationCap size={26} /> LESSON.LAB
      </Link>

      <div className="text-[96px] sm:text-[120px] md:text-[180px] font-black leading-none text-slate-900 dark:text-white tracking-tighter opacity-10 select-none">
        404
      </div>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter mt-6 mb-4 text-slate-900 dark:text-white">
        {t.title}
      </h1>
      <p className="text-slate-400 mb-10 max-w-sm leading-relaxed">
        {t.body}
      </p>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl border-[2px] border-black dark:border-white font-black uppercase text-[11px] tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
        >
          {t.back}
        </button>
        <Link
          to={user ? "/hub" : "/"}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl border-[2px] border-black font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          {user ? t.hub : t.home}
        </Link>
      </div>
    </div>
  );
}
