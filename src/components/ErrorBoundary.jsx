import React from "react";
import { GraduationCap } from "lucide-react";

// Error boundary — тут ИМЕННО класс: React ловит ошибки рендера только через
// getDerivedStateFromError/componentDidCatch, для которых до сих пор нет
// хук-эквивалента. Раньше такого компонента в приложении не было вообще:
// любая ошибка рендера в любой странице роняла всё дерево до пустого белого
// экрана без единой подсказки, что случилось и что делать.
//
// Язык читаем напрямую из localStorage (тот же ключ, что App.jsx), а не
// через пропс/контекст: этот компонент — последняя линия обороны и должен
// пережить поломку чего угодно выше по дереву, включая, возможно, сам
// провайдер языка.
const T = {
  RU: {
    title: "Что-то пошло не так",
    body: "Страница столкнулась с ошибкой. Мы уже знаем — можно попробовать перезагрузить.",
    reload: "Перезагрузить",
    home: "На главную",
  },
  KZ: {
    title: "Бірдеңе дұрыс болмады",
    body: "Бетте қате орын алды. Біз хабардармыз — қайта жүктеп көріңіз.",
    reload: "Қайта жүктеу",
    home: "Басты бетке",
  },
  EN: {
    title: "Something went wrong",
    body: "This page hit an error. We're aware — try reloading.",
    reload: "Reload",
    home: "Go home",
  },
};

function currentLang() {
  try {
    return localStorage.getItem("app_lang") || "RU";
  } catch {
    return "RU"; // localStorage может быть недоступен (приватный режим и т.п.)
  }
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Тот же console.error, что и везде в приложении для пойманных ошибок —
    // ничего специального тут не выстроено, но хотя бы видно в консоли/логах.
    console.error("ErrorBoundary caught a render error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const t = T[currentLang()] || T.RU;

    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex flex-col items-center justify-center text-center px-5 sm:px-8 py-16">
        <a href="/" className="flex items-center gap-2 font-black text-lg sm:text-xl italic tracking-tighter text-emerald-600 mb-12 sm:mb-16">
          <GraduationCap size={26} /> LESSON.LAB
        </a>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-slate-900 dark:text-white">
          {t.title}
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 mb-10 max-w-sm leading-relaxed">
          {t.body}
        </p>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl border-[2px] border-black font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            {t.reload}
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-xl border-[2px] border-black dark:border-white font-black uppercase text-[11px] tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
          >
            {t.home}
          </a>
        </div>
      </div>
    );
  }
}
