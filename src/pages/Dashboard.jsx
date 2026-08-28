import { useState, useEffect, useRef } from "react";

import ReactMarkdown from "react-markdown";
import { MoreVertical, Edit3, Trash2, History, Sparkles, Loader2, AlertCircle } from "lucide-react";

import api from "../api";
// Оставили только ОДИН чистый импорт
import { cached, invalidatePrefixRaw, lessonPlansListCached } from "../apiCache";
import Header from "../components/Header";
import { Skeleton } from "../components/Skeleton";
import { I18N as t, tr } from "../lib/i18n";
import { payloadToMarkdown } from "../lib/lessonPlanDoc";
import { buildPrompt } from "../lib/prompt";

// Строки самой страницы генерации (не покрытые общим i18n)
const GEN = {
  RU: {
    generating: "ГЕНЕРИРУЕМ...",
    emptyOutput: "Здесь появится план урока.\nЗаполните предмет и тему слева.",
    gradeSuffix: "Класс", minSuffix: "Мин",
    edit: "Редактировать", del: "Удалить",
    errParse: "Не удалось разобрать ответ модели. Попробуйте сгенерировать ещё раз.",
    errGeneric: "Ошибка генерации. Проверьте соединение и попробуйте снова.",
  },
  KZ: {
    generating: "ЖАСАЛУДА...",
    emptyOutput: "Мұнда сабақ жоспары пайда болады.\nСол жақта пән мен тақырыпты толтырыңыз.",
    gradeSuffix: "сынып", minSuffix: "мин",
    edit: "Өңдеу", del: "Жою",
    errParse: "Модельдің жауабын талдау мүмкін болмады. Қайта жасап көріңіз.",
    errGeneric: "Генерация қатесі. Байланысты тексеріп, қайталаңыз.",
  },
  EN: {
    generating: "GENERATING...",
    emptyOutput: "Your lesson plan will appear here.\nFill in subject and topic on the left.",
    gradeSuffix: "Grade", minSuffix: "min",
    edit: "Edit", del: "Delete",
    errParse: "Could not parse the model's response. Try generating again.",
    errGeneric: "Generation failed. Check your connection and try again.",
  },
};


function extractJsonObject(s) {
  if (!s) return "";
  const i = s.indexOf("{");
  const j = s.lastIndexOf("}");
  if (i === -1 || j === -1 || j <= i) return s.trim();
  return s.slice(i, j + 1).trim();
}

export default function Dashboard({
  dark, setDark, fontSize, setFontSize, highContrast, setHighContrast, 
  lang, setLang, user, setUser, promptConfig, grantAchievement
}) {
  const accessProps = { dark, setDark, fontSize, setFontSize, highContrast, setHighContrast, lang, setLang, user, setUser };

  const [form, setForm] = useState({ subject: "", topic: "", details: "", grade: "5", duration: "45" });
  const [planOutput, setPlanOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lessonPlans, setLessonPlans] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const activeIdRef = useRef(null);
  const cur = t[lang] || t.RU;
  const GEN_T = GEN[lang] || GEN.RU;

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  // 1. ПРОВЕРКА НА АЧИВКУ (Архитектор)
  useEffect(() => {
    if (lessonPlans.length >= 10) {
      grantAchievement("architect_10");
    }
  }, [lessonPlans.length, grantAchievement]);

  // 2. ЕДИНАЯ ЗАГРУЗКА ИСТОРИИ (С КЭШЕМ)
  useEffect(() => {
    let alive = true;

    const loadLessonPlans = async () => {
      try {
        const data = await lessonPlansListCached(50, 60000);
        if (!alive) return;

        const items =
          Array.isArray(data) ? data :
          Array.isArray(data?.items) ? data.items :
          Array.isArray(data?.rows) ? data.rows :
          Array.isArray(data?.data) ? data.data :
          [];

        // Фильтр по типу больше не нужен: сервер отдаёт только планы уроков
        const plans = items
          .filter(Boolean)
          .map((x) => ({
            id: x.id,
            name: x.topic || `#${x.teacher_seq ?? x.id}`,
            status: x.status,
          }));

        setLessonPlans(plans);

        setActiveId((prev) => {
          if (prev) return prev;
          return plans[0]?.id ?? null;
        });

      } catch (e) {
        console.error("Failed to load lesson plans:", e);
      }
    };

    loadLessonPlans();
    return () => { alive = false; };
  }, []);

  // 3. ЗАГРУЗКА КОНКРЕТНОГО ПЛАНА (С КЭШЕМ)
  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    (async () => {
      try {
        const r = await cached("lessonPlans.get", () => api.lessonPlans.get(activeId), { id: activeId }, 1800000);
        if (!alive) return;
        const it = r?.item || r;
        const next = it?.result_md || it?.result || null;
        if (next) setPlanOutput(next);
      } catch (e) { console.error(e); }
    })();
    return () => { alive = false; };
  }, [activeId]);

  // Патчит статус элемента в локальном списке истории, чтобы не ждать
  // следующего relist — раньше и успешная, и упавшая генерация навсегда
  // застревали в списке с исходным "running", неотличимые друг от друга.
  const setPlanStatus = (id, status) => {
    setLessonPlans(prev => prev.map(p => (p.id === id ? { ...p, status } : p)));
  };

  // 4. ГЕНЕРАЦИЯ
  const handleGenerate = async () => {
    if (!form.subject || !form.topic) return;
    setLoading(true); setPlanOutput("");
    const vars = { lang, ...form };
    const promptText = buildPrompt("lesson_plan", vars, promptConfig);

    // Вне try, чтобы catch знал, какую запись пометить "error", а не просто
    // оставить её висеть в истории как вечный "running".
    let createdPlanId = null;

    try {
      const plan = await api.lessonPlans.create({
        type: 'lesson_plan', ...form, lang, prompt: promptText, status: "running"
      });
      createdPlanId = plan.id;

      setActiveId(plan.id);
      activeIdRef.current = plan.id;
      setLessonPlans(prev => [{ id: plan.id, name: form.topic, status: "running" }, ...prev]);

      let jsonText = "";
      for await (const delta of api.generateStream({ prompt: promptText })) {
        jsonText += (typeof delta === "string" ? delta : delta?.text || "");
      }

      let payload = null;
      try { payload = JSON.parse(extractJsonObject(jsonText)); } catch (e) { payload = null; }

      if (!payload) {
        setPlanOutput(GEN_T.errParse);
        setPlanStatus(plan.id, "error");
        await api.lessonPlans.update(plan.id, { status: "error" }).catch(() => {});
        invalidatePrefixRaw("lessonPlans.list");
        return;
      }

      const md = payloadToMarkdown(payload, lang);
      setPlanOutput(md);

      await api.lessonPlans.update(plan.id, {
        status: "done",
        result_md: md,
        result_json: payload,
        result_json_version: 1,
        template_key: "kmj_kazakh_january"
      });
      setPlanStatus(plan.id, "done");

      invalidatePrefixRaw("lessonPlans.list");

      const hour = new Date().getHours();
      if (hour >= 0 && hour < 5) {
        grantAchievement("night_owl");
      }

      if (lessonPlans.length === 9) {
        grantAchievement("architect_10");
      }

    } catch (e) {
      setPlanOutput(GEN_T.errGeneric);
      if (createdPlanId) {
        setPlanStatus(createdPlanId, "error");
        api.lessonPlans.update(createdPlanId, { status: "error" }).catch(() => {});
        invalidatePrefixRaw("lessonPlans.list");
      }
    } finally {
      setLoading(false);
    }
  };

  const fontClass = fontSize === "lg" ? "text-lg" : fontSize === "xl" ? "text-xl" : "text-base";

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen lg:h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-zinc-100 font-sans p-4 sm:p-6 gap-4 sm:gap-6 pt-[100px] lg:pt-[120px] relative lg:overflow-hidden ${fontClass}`}>
      <Header {...accessProps} />

      <aside className="w-full lg:w-80 shrink-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl rounded-[32px] lg:rounded-[40px] border border-white/20 flex flex-col shadow-xl max-h-[320px] lg:max-h-none">
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <div className="text-[10px] font-black opacity-30 mb-8 tracking-[0.3em] uppercase">{cur.h}</div>
          {lessonPlans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center opacity-50">
              <History size={32} className="mb-3 opacity-40" />
              <p className="text-sm font-bold leading-snug">
                {lang === "KZ" ? "Жоспарлар жоқ әлі.\nАлғашқы сабақты жасаңыз." : lang === "EN" ? "No plans yet.\nCreate your first lesson." : "Планов пока нет.\nСоздайте первый урок."}
              </p>
            </div>
          )}
          <div className="space-y-4">
            {lessonPlans.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveId(item.id);
                  activeIdRef.current = item.id;
                  setActiveMenu(null);
                }}
                className={`group relative p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/40 hover:bg-emerald-600 hover:text-white transition-all shadow-sm cursor-pointer
                  ${activeId === item.id ? "ring-4 ring-emerald-500/20" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 min-w-0">
                    {item.status === "running" && <Loader2 size={13} className="shrink-0 animate-spin opacity-60" />}
                    {item.status === "error" && <AlertCircle size={13} className="shrink-0 text-red-500 group-hover:text-white" />}
                    <span className="text-[13px] font-bold opacity-80 group-hover:opacity-100 truncate w-36">
                      {item.name}
                    </span>
                  </span>

                  <div className="relative z-30">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // важно: не выбирать item
                        setActiveMenu((prev) => (prev === item.id ? null : item.id));
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-white/15"
                      aria-label="Menu"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenu === item.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActiveMenu(null)}
                        />

                        <div
                          className="absolute right-0 top-full mt-2 z-50 min-w-[190px]
                                    rounded-2xl bg-white dark:bg-zinc-950
                                    border border-black/10 dark:border-white/10
                                    shadow-2xl overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveMenu(null);
                              // TODO: edit handler
                            }}
                          >
                            <Edit3 size={16} /> {GEN_T.edit}
                          </button>

                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-red-600"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveMenu(null);

                              try {
                                await api.lessonPlans.remove(item.id);

                                setLessonPlans((prev) => {
                                  const next = prev.filter((x) => x.id !== item.id);

                                  setActiveId((prevActive) => {
                                    if (prevActive !== item.id) return prevActive;
                                    return next[0]?.id ?? null;
                                  });

                                  return next;
                                });

                                invalidatePrefixRaw("lessonPlans.list");
                              } catch (err) {
                                console.error("delete failed", err);
                              }
                            }}
                          >
                            <Trash2 size={16} /> {GEN_T.del}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>      

      <main className="flex-1 min-w-0 flex flex-col xl:flex-row gap-4 md:gap-6 lg:overflow-hidden">
        <section className="w-full xl:w-[480px] shrink-0 p-6 sm:p-10 xl:p-12 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto">
          <div className="flex justify-between items-center mb-8 sm:mb-12">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-emerald-600">PLANNER</h2>
          </div>
          <div className="space-y-6 sm:space-y-10">
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className="w-full p-4 sm:p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm outline-none">
                {[...Array(11)].map((_, i) => <option key={i+1} value={i+1}>{i+1} {GEN_T.gradeSuffix}</option>)}
              </select>
              <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full p-4 sm:p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm outline-none">
                {[45, 90, 135].map(v => <option key={v} value={v}>{v} {GEN_T.minSuffix}</option>)}
              </select>
            </div>
            <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder={cur.s} aria-label={cur.s} className="w-full p-5 sm:p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-emerald-500/10 transition-all" />
            <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder={cur.t} aria-label={cur.t} className="w-full p-5 sm:p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-emerald-500/10 transition-all" />
            <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} placeholder={cur.d} aria-label={cur.d} className="w-full p-5 sm:p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold h-40 sm:h-52 resize-none focus:ring-4 ring-emerald-500/10 transition-all" />
            <button onClick={handleGenerate} disabled={loading} className={`w-full py-5 sm:py-7 rounded-[24px] sm:rounded-[28px] text-[13px] sm:text-[15px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all border-[4px] border-black dark:border-white shadow-2xl ${loading ? 'bg-slate-200 dark:bg-zinc-800 text-slate-500' : 'bg-emerald-600 text-white hover:scale-[1.02]'}`}>
                {loading ? GEN_T.generating : tr(lang,"doc.createPlan","СОЗДАТЬ ПЛАН")}
            </button>
          </div>
        </section>
        <section className="flex-1 min-w-0 p-6 sm:p-10 xl:p-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[32px] sm:rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto min-h-[360px]">
          {planOutput ? (
            <div className="prose prose-emerald dark:prose-invert max-w-none break-words prose-headings:font-black prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-strong:text-slate-900 dark:prose-strong:text-white"><ReactMarkdown>{planOutput}</ReactMarkdown></div>
          ) : loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3 mb-6" />
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-5/6' : 'w-full'}`} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[280px] opacity-50">
              <Sparkles size={36} className="mb-4 opacity-40" />
              <p className="font-bold text-sm max-w-xs leading-relaxed whitespace-pre-line">{GEN_T.emptyOutput}</p>
            </div>
          )}
          <button
            disabled={!activeId}
            onClick={() => {
              if (!activeId) return;
              window.location.href = `/api/generations/${activeId}/export-docx`;
            }}
            className="mt-6 w-full py-4 rounded-2xl font-black uppercase tracking-widest bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
          >
            {tr(lang,"doc.exportDocx","ВЫГРУЗИТЬ DOCX")}
          </button>
        </section>
      </main>
    </div>
  );

}
