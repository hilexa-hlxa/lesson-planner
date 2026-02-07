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

        const sidebar = (data?.items || [])
          .filter(x => x.type === 'lesson_plan')
          .map((x) => ({ id: x.id, name: x.topic || `#${x.id}`, status: x.status }));

        setHistory(sidebar);
        if (!activeIdRef.current && sidebar[0]?.id) setActiveId(sidebar[0].id);
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
        setRes(it?.result_md || it?.result || "");
      } catch (e) { setRes(""); }
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
      setHistory(prev => [{ id: gen.id, name: form.topic, status: "running" }, ...prev]);
      
      let text = "";
      for await (const delta of api.generateStream({ prompt: promptText })) {
        text += (typeof delta === "string" ? delta : delta?.text || "");
        if (activeIdRef.current === gen.id) setRes(text);
      }
      
      await api.generations.update(gen.id, { status: "done", result_md: text });

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
                onClick={() => { setActiveId(item.id); setActiveMenu(null); }}
                className={`group relative p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/40 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer ${activeId === item.id ? "ring-4 ring-blue-500/20" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold opacity-80 group-hover:opacity-100 truncate w-40">{item.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg">
                    <MoreVertical size={16}/>
                  </button>
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
                <option value="45">45 Мин</option><option value="60">60 Мин</option>
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
        </section>
      </main>
    </div>
  );
}