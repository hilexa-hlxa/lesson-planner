import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { I18N as t } from "../lib/i18n";
import { DEFAULT_PROMPT_CONFIG } from "../lib/prompt";

export default function PromptsPage({ lang, promptConfig, setPromptConfig }) {
  const [local, setLocal] = useState(promptConfig);
  const cur = t[lang]?.prompts || t.RU.prompts;

  useEffect(() => setLocal(promptConfig), [promptConfig]);

  const save = () => setPromptConfig(local);

  const reset = () => {
    setLocal(DEFAULT_PROMPT_CONFIG);
    setPromptConfig(DEFAULT_PROMPT_CONFIG);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 font-black uppercase text-[10px] hover:text-blue-600 transition tracking-widest mb-8">
          <ChevronRight size={14} className="rotate-180" /> {cur.back}
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-3">{cur.title}</h1>
        <p className="opacity-60 font-medium mb-10 whitespace-pre-line">{cur.subtitle}</p>

        <div className="space-y-10">
          <div className="p-8 bg-white/70 dark:bg-zinc-900/60 rounded-[32px] border border-white/20 shadow-xl">
            <h2 className="font-black uppercase tracking-widest text-[12px] mb-6 text-blue-600">{cur.lessonTitle}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{cur.style}</div>
                <select
                  value={local.lesson_plan.style}
                  onChange={(e) => setLocal({ ...local, lesson_plan: { ...local.lesson_plan, style: e.target.value } })}
                  className="w-full p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm"
                >
                  <option value="strict">{cur.strict}</option>
                  <option value="friendly">{cur.friendly}</option>
                  <option value="short">{cur.short}</option>
                </select>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{cur.detail}</div>
                <select
                  value={local.lesson_plan.detailLevel}
                  onChange={(e) => setLocal({ ...local, lesson_plan: { ...local.lesson_plan, detailLevel: e.target.value } })}
                  className="w-full p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm"
                >
                  <option value="low">{cur.low}</option>
                  <option value="medium">{cur.medium}</option>
                  <option value="high">{cur.high}</option>
                </select>
              </div>

              {[
                ["includeTiming", cur.includeTiming],
                ["includeDifferentiation", cur.includeDifferentiation],
                ["includeAssessment", cur.includeAssessment],
                ["includeHomework", cur.includeHomework],
                ["markdown", cur.markdown],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm">
                  <input
                    type="checkbox"
                    checked={!!local.lesson_plan[key]}
                    onChange={(e) => setLocal({ ...local, lesson_plan: { ...local.lesson_plan, [key]: e.target.checked } })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="p-8 bg-white/70 dark:bg-zinc-900/60 rounded-[32px] border border-white/20 shadow-xl">
            <h2 className="font-black uppercase tracking-widest text-[12px] mb-6 text-blue-600">{cur.testsTitle}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{cur.difficulty}</div>
                <select
                  value={local.tests.difficulty}
                  onChange={(e) => setLocal({ ...local, tests: { ...local.tests, difficulty: e.target.value } })}
                  className="w-full p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm"
                >
                  <option value="easy">{cur.easy}</option>
                  <option value="medium">{cur.medium}</option>
                  <option value="hard">{cur.hard}</option>
                </select>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{cur.total}</div>
                <input
                  type="number"
                  min={1}
                  value={local.tests.total}
                  onChange={(e) =>
                    setLocal({ ...local, tests: { ...local.tests, total: Math.max(1, Number(e.target.value || 1)) } })
                  }
                  className="w-full p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm"
                />
              </div>

              {[
                ["includeAnswers", cur.includeAnswers],
                ["markdown", cur.markdown],
                ["shuffle", cur.shuffle],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl font-bold text-sm">
                  <input
                    type="checkbox"
                    checked={!!local.tests[key]}
                    onChange={(e) => setLocal({ ...local, tests: { ...local.tests, [key]: e.target.checked } })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={reset} className="px-8 py-4 rounded-2xl border-2 border-black dark:border-white font-black uppercase text-[11px] tracking-widest">
              {cur.reset}
            </button>
            <button
              onClick={save}
              className="px-8 py-4 rounded-2xl bg-blue-600 text-white border-2 border-black font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {cur.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
