import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { MoreVertical, Edit3, Trash2, History, Sparkles } from "lucide-react";

import api from "../api";
// Оставили только ОДИН чистый импорт
import { cached, invalidatePrefixRaw, generationsListCached } from "../apiCache";
import Header from "../components/Header";
import { I18N as t, tr } from "../lib/i18n";
import { buildPrompt } from "../lib/prompt";

function payloadToMarkdown(p, lang) {
  const sec = p?.sections || {};
  const sm = (t[lang] || t.RU)?.doc?.sections || t.RU.doc.sections;

  const lines = [];
  lines.push(`## ${tr(lang,"doc.lessonPlan","План урока")}`);
  lines.push(`**${tr(lang,"s","Предмет")}:** ${p?.meta?.subject || ""}`);
  lines.push(`**${tr(lang,"t","Тема")}:** ${p?.meta?.topic || ""}`);
  lines.push(`**Grade:** ${p?.meta?.grade ?? ""}  **Duration:** ${p?.meta?.duration ?? ""} min`);
  if (p?.meta?.details) lines.push(`**${tr(lang,"d","Детали")}:** ${p.meta.details}`);
  lines.push("");

  const renderList = (title, arr) => {
    lines.push(`## ${title}`);
    const a = Array.isArray(arr) ? arr : [];
    if (!a.length) { lines.push("-"); lines.push(""); return; }
    for (const x of a) lines.push(`- ${String(x)}`);
    lines.push("");
  };

  renderList(sm.goals, sec.goals);
  renderList(sm.equipment, sec.equipment);
  renderList(sm.key_concepts, sec.key_concepts);

  // timeline как таблица markdown
  lines.push(`## ${sm.timeline}`);
  lines.push(`| Stage | Minutes | Teacher | Student | Assessment | Resources |`);
  lines.push(`|---|---|---|---|---|---|`);
  const tl = Array.isArray(p?.timeline) ? p.timeline : [];
  for (const r of tl) {
    lines.push(`| ${r.stage||""} | ${r.minutes||""} | ${r.teacher||""} | ${r.student||""} | ${r.assessment||""} | ${r.resources||""} |`);
  }
  lines.push("");

  renderList(sm.tasks, sec.tasks);
  renderList(sm.differentiation, sec.differentiation);
  renderList(sm.assessment, sec.assessment);
  renderList(sm.homework, sec.homework);

  return lines.join("\n");
}

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
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const navigate = useNavigate();
  const activeIdRef = useRef(null);
  const cur = t[lang] || t.RU;

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  // 1. ПРОВЕРКА НА АЧИВКУ (Архитектор)
  useEffect(() => {
    if (history.length >= 10) {
      grantAchievement({ title: "Архитектор знаний", reward: 250, key: "architect_10" });
    }
  }, [history.length]);

  // 2. ЕДИНАЯ ЗАГРУЗКА ИСТОРИИ (С КЭШЕМ)
  useEffect(() => {
    let alive = true;

    const loadHistory = async () => {
      try {
        // Используем обертку из apiCache
        const data = await generationsListCached(50, 60000);
        if (!alive) return;

        // Нормализуем items (на случай если обертка вернет не {items:[]})
        const items =
          Array.isArray(data) ? data :
          Array.isArray(data?.items) ? data.items :
          Array.isArray(data?.rows) ? data.rows :
          Array.isArray(data?.data) ? data.data :
          [];

        const sidebar = items
          .filter(x => {
            if (!x) return false;
            const type = String(x.type || "").trim().toLowerCase();
            return (
              type === "lesson_plan" ||
              type === "lessonplan" ||
              type === "lesson-plan" ||
              type === "" // на старых записях могло не быть type
            );
          })
          .map((x) => ({
            id: x.id,
            name: x.topic || `#${x.teacher_seq ?? x.id}`,
            status: x.status,
          }));

        setHistory(sidebar);

        // если активного id еще нет — выбираем первый элемент
        setActiveId((prev) => {
          if (prev) return prev;
          return sidebar[0]?.id ?? null;
        });

      } catch (e) {
        console.error("Ошибка загрузки истории:", e);
      }
    };

    loadHistory();
    return () => { alive = false; };
  }, []);

  // 3. ЗАГРУЗКА КОНКРЕТНОГО ПЛАНА (С КЭШЕМ)
  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    (async () => {
      try {
        const r = await cached("generations.get", () => api.generations.get(activeId), { id: activeId }, 1800000);
        if (!alive) return;
        const it = r?.item || r;
        const next = it?.result_md || it?.result || null;
        if (next) setRes(next);
      } catch (e) { console.error(e); }
    })();
    return () => { alive = false; };
  }, [activeId]);

  // 4. ГЕНЕРАЦИЯ
  const handleGenerate = async () => {
    if (!form.subject || !form.topic) return;
    setLoading(true); setRes("");
    const vars = { lang, ...form };
    const promptText = buildPrompt("lesson_plan", vars, promptConfig);
    
    try {
      const gen = await api.generations.create({ 
        type: 'lesson_plan', ...form, lang, prompt: promptText, status: "running" 
      });
      
      setActiveId(gen.id);
      activeIdRef.current = gen.id;
      setHistory(prev => [{ id: gen.id, name: form.topic, status: "running" }, ...prev]);
      
      let jsonText = "";
      for await (const delta of api.generateStream({ prompt: promptText })) {
        jsonText += (typeof delta === "string" ? delta : delta?.text || "");

        // опционально: показывать "превью" пока идёт стрим
        // можешь показывать jsonText как есть или попытаться парсить "на лету" — не надо, опасно
      }

      // parse
      let payload = null;
      try { payload = JSON.parse(extractJsonObject(jsonText)); } catch (e) { payload = null; }

      if (!payload) {
        setRes("Error: invalid JSON from model");
        return;
      }

      const md = payloadToMarkdown(payload, lang);
      setRes(md);

      await api.generations.update(gen.id, {
        status: "done",
        result_md: md,         // UI-friendly
        result_json: payload,  // для DOCX/Go
        result_json_version: 1,
        template_key: "kmj_kazakh_january"
      });

      // СБРОС КЭША СПИСКА (чтобы новый план появился везде)
      invalidatePrefixRaw("generations.list"); 

      // АЧИВКИ
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 5) {
        grantAchievement({ title: "Ночная смена", reward: 100, key: "night_owl" });
      }

      if (history.length === 9) {
        grantAchievement({ title: "Архитектор знаний", reward: 250, key: "architect_10" });
      }

    } catch (e) { 
      setRes("Error."); 
    } finally { 
      setLoading(false); 
    }
  };

  const fontClass = fontSize === "lg" ? "text-lg" : fontSize === "xl" ? "text-xl" : "text-base";

  return (
    <div className={`flex h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-zinc-100 font-sans p-6 gap-6 pt-[120px] relative overflow-hidden ${fontClass}`}>
      <Header {...accessProps} />

      <aside className="w-80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl rounded-[40px] border border-white/20 flex flex-col shadow-xl">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="text-[10px] font-black opacity-30 mb-8 tracking-[0.3em] uppercase">{cur.h}</div>
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveId(item.id);
                  activeIdRef.current = item.id;
                  setActiveMenu(null);
                }}
                className={`group relative p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/40 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer
                  ${activeId === item.id ? "ring-4 ring-blue-500/20" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold opacity-80 group-hover:opacity-100 truncate w-40">
                    {item.name}
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
                            <Edit3 size={16} /> Редактировать
                          </button>

                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-red-600"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveMenu(null);

                              try {
                                await api.generations.remove(item.id);

                                setHistory((prev) => {
                                  const next = prev.filter((x) => x.id !== item.id);

                                  setActiveId((prevActive) => {
                                    if (prevActive !== item.id) return prevActive;
                                    return next[0]?.id ?? null;
                                  });

                                  return next;
                                });

                                invalidatePrefixRaw("generations.list");
                              } catch (err) {
                                console.error("delete failed", err);
                              }
                            }}
                          >
                            <Trash2 size={16} /> Удалить
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

      <main className="flex-1 flex flex-col xl:flex-row gap-4 md:gap-6 overflow-hidden">
        <section className="w-[480px] p-12 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto">    
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-blue-600">PLANNER</h2>
          </div>
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className="w-full p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm outline-none">
                {[...Array(11)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Класс</option>)}
              </select>
              <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm outline-none">
                <option value="45">45 Мин</option><option value="90">90 Мин</option><option value="135">135 Мин</option>
              </select>
            </div>
            <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder={cur.s} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-blue-500/10 transition-all" />
            <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder={cur.t} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-blue-500/10 transition-all" />
            <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} placeholder={cur.d} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold h-52 resize-none focus:ring-4 ring-blue-500/10 transition-all" />
            <button onClick={handleGenerate} disabled={loading} className={`w-full py-7 rounded-[28px] text-[15px] font-black uppercase tracking-[0.3em] transition-all border-[4px] border-black dark:border-white shadow-2xl ${loading ? 'bg-slate-200' : 'bg-blue-600 text-white hover:scale-[1.02]'}`}>
                {loading ? "..." : tr(lang,"doc.createPlan","СОЗДАТЬ ПЛАН")}
            </button>
          </div>
        </section>
        <section className="flex-1 p-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto">
          <div className="prose dark:prose-invert max-w-none leading-relaxed italic"><ReactMarkdown>{res || "..."}</ReactMarkdown></div>
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
