import React from "react";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Общая обёртка для статических страниц (Политика, Условия, Тарифы).
 * Держит одинаковые отступы, типографику и хедер/футер.
 */
export default function StaticPage({ lang, setLang, user, setUser, title, subtitle, updated, children, ...accessProps }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px]">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-[0.95] mb-4 break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-base sm:text-lg mb-4">{subtitle}</p>
        )}
        {updated && (
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-10">{updated}</p>
        )}

        <div className="space-y-8">{children}</div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-3">{title}</h2>
      <div className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[15px] space-y-2">{children}</div>
    </section>
  );
}

export function Bullets({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="text-emerald-500 font-black shrink-0">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
