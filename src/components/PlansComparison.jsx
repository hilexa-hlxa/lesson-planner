import React from "react";
import { Check, Plus, Mail, Sparkles } from "lucide-react";
import { plansFor } from "../lib/plans";
import { CONTACT_EMAIL } from "../siteConfig";

/**
 * Сравнение тарифов. Используется и на лендинге, и на /pricing, чтобы две
 * страницы не разошлись в обещаниях.
 *
 * PRO намеренно без цены и с пометкой «скоро»: тариф не запущен, и выдумывать
 * цифры на публичной странице нельзя.
 */
export default function PlansComparison({ lang = "RU", user, onStart, showHeading = true }) {
  const t = plansFor(lang);

  return (
    <div>
      {showHeading && (
        <div className="mb-10 sm:mb-12 text-center">
          <div className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-600 mb-3">
            {t.sectionTag}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter break-words">
            {t.sectionTitle}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm max-w-lg mx-auto leading-relaxed">
            {t.sectionSub}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* ── Бесплатный: то, что реально работает сегодня ── */}
        <div className="rounded-[28px] sm:rounded-[32px] border-[3px] border-black dark:border-white bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.15)]">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-3">{t.free.name}</div>
          <div className="flex items-end gap-2 flex-wrap mb-1">
            <span className="text-4xl sm:text-5xl font-black tracking-tighter">{t.free.price}</span>
            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs mb-2">{t.free.period}</span>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6">{t.free.note}</p>

          <ul className="space-y-2.5 mb-7">
            {t.free.features.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px]">
                <span className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center shrink-0 border-2 border-black mt-0.5">
                  <Check size={9} color="white" strokeWidth={3.5} />
                </span>
                <span className="text-slate-700 dark:text-zinc-300 font-medium">{f}</span>
              </li>
            ))}
          </ul>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6 border-t border-slate-100 dark:border-zinc-800 pt-4">
            {t.free.limits}
          </p>

          <button
            onClick={onStart}
            className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-[13px]"
          >
            {user ? t.free.ctaAuthed : t.free.cta}
          </button>
        </div>

        {/* ── PRO: ещё не запущен, поэтому без цены и приглушённый ── */}
        <div className="rounded-[28px] sm:rounded-[32px] border-[3px] border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/40 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{t.pro.name}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest">
              <Sparkles size={9} /> {t.pro.badge}
            </span>
          </div>
          <div className="flex items-end gap-2 flex-wrap mb-1">
            <span className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-300 dark:text-zinc-600">{t.pro.price}</span>
            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs mb-2">{t.pro.period}</span>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6">{t.pro.note}</p>

          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">{t.pro.inherits}</p>
          <ul className="space-y-2.5 mb-7">
            {t.pro.features.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px]">
                <span className="w-4 h-4 bg-slate-300 dark:bg-zinc-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Plus size={9} color="white" strokeWidth={3.5} />
                </span>
                <span className="text-slate-500 dark:text-zinc-400 font-medium">{f}</span>
              </li>
            ))}
          </ul>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6 border-t border-slate-200 dark:border-zinc-800 pt-4">
            {t.pro.planned}
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${t.pro.name}: ${t.pro.cta}`)}`}
            className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 font-black uppercase tracking-widest rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-black dark:hover:border-white transition-all text-[13px]"
          >
            <Mail size={14} /> {t.pro.cta}
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8 leading-relaxed">
        {t.schoolsNote}{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-black text-emerald-600 hover:underline">{CONTACT_EMAIL}</a>
      </p>
    </div>
  );
}
