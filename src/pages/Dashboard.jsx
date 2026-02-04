import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import { Sun, Moon, MoreVertical, Edit3, Trash2, LogOut } from "lucide-react";

import api from "../api";
import { cached, invalidate, invalidatePrefixRaw } from "../apiCache";

import LanguageSwitcher from "../components/LanguageSwitcher";

import { I18N as t, tr } from "../lib/i18n";
import { buildPrompt } from "../lib/prompt";


export default function Dashboard ({
  lang,
  setLang,
  user,
  setUser,
  dark,
  setDark,
  promptConfig
}) {
  // --- UI Preferences ---
  const [fontSize, setFontSize] = useState("md");
  const [highContrast, setHighContrast] = useState(false);

  // --- Main State ---
  const [form, setForm] = useState({ subject: "", topic: "", details: "", grade: "5", duration: "45" });
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const navigate = useNavigate();
  const activeIdRef = useRef(null);
  const cur = t[lang] || t.RU;

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await cached("generations.list", () => api.generations.list(500), { limit: 500 }, 1000 * 60 * 60 * 24 * 365);
        if (!alive) return;
        const items = list?.items || [];
        const full = await Promise.all(
          items.map(async (x) => {
            const r = await cached("generations.get", () => api.generations.get(x.id), { id: x.id }, 1000 * 60 * 60 * 24 * 365);
            const it = r?.item || r;
            return {
              id: x.id,
              name: x.topic || `#${x.id}`,
              status: x.status,
              created_at: x.created_at,
              content: it?.result_md || it?.result || it?.prompt || "",
            };
          })
        );
        if (!alive) return;
        setHistory(full);
        if (full[0]?.id) {
          setActiveId(full[0].id);
          setRes(full[0].content || "");
        }
      } catch (e) {
        console.error("history preload failed", e);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleGenerate = async () => {
    if (!form.subject || !form.topic) return;

    const vars = {
      lang,
      subject: form.subject,
      topic: form.topic,
      grade: form.grade,
      duration: form.duration,
      details: form.details,
    };

    setLoading(true);
    setRes("");

    const promptText = buildPrompt("lesson_plan", vars, promptConfig);

    let generationId = null;

    try {
      const gen = await api.generations.create({
        subject: form.subject,
        topic: form.topic,
        details: form.details,
        grade: form.grade,
        duration: form.duration,
        lang,
        prompt: promptText,
        status: "running",
      });

      generationId = gen?.id;
      if (!generationId) throw new Error("No generationId");

      invalidate("generations.list");
      setActiveId(generationId);
      activeIdRef.current = generationId;

      setHistory((prev) => {
        if (prev.some((x) => x.id === generationId)) return prev;
        return [{ id: generationId, name: form.topic, status: "running", content: "" }, ...prev];
      });

      let accumulatedText = "";

      for await (const evt of api.generateStream({ prompt: promptText })) {
        const delta = typeof evt === "string" ? evt : (evt?.type === "delta" ? (evt.text || "") : "");
        if (!delta) continue;
        accumulatedText += delta;
        if (activeIdRef.current === generationId) {
          setRes(accumulatedText);
        }
      }

      await api.generations.update(generationId, {
        status: "done",
        result_md: accumulatedText,
      });

      await cached(
        "generations.get",
        async () => ({
          item: { id: generationId, topic: form.topic, status: "done", result_md: accumulatedText }
        }),
        { id: generationId },
        1000 * 60 * 60 * 24 * 365
      );

      invalidate("generations.list");

      setHistory((prev) =>
        prev.map((x) => x.id === generationId ? { ...x, status: "done", name: form.topic, content: accumulatedText } : x)
      );
    } catch (error) {
      console.error("Error:", error);
      setRes(`## Error\n${String(error?.message || error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Apply UI preference classes
  const containerClass = highContrast ? "grayscale contrast-125" : "";
  const fontClass = fontSize === "lg" ? "text-lg" : fontSize === "xl" ? "text-xl" : "text-base";

  return (
    <div className={`flex h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-zinc-100 font-sans p-6 gap-6 relative overflow-hidden ${containerClass} ${fontClass}`}>
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl rounded-[40px] border border-white/20 flex flex-col shadow-xl">
        <div className="p-10 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <Link to="/hub" className="font-black text-xl italic tracking-tighter text-blue-600">
              LESSON.LAB
            </Link>
            
            {/* UI Toggle Controls */}
            <div className="flex items-center gap-2">
              <button onClick={() => setDark(!dark)} className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm transition-all hover:scale-110">
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              
              {/* HC (High Contrast) */}
              <button onClick={() => setHighContrast(!highContrast)} className="px-2 py-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest hover:scale-105 transition border border-transparent hover:border-black">
                {highContrast ? "HC ON" : "HC"}
              </button>
              
              {/* Font Size */}
              <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="px-2 py-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                <option value="md">A</option>
                <option value="lg">A+</option>
                <option value="xl">A++</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="text-[10px] font-black opacity-30 mb-8 tracking-[0.3em] uppercase">{cur.h}</div>
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => { setActiveId(item.id); setRes(item.content || ""); setActiveMenu(null); }}
                className={`group relative p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/40 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer ${
                  activeId === item.id ? "ring-4 ring-blue-500/20" : ""
                }`}
              >
                {editingId === item.id ? (
                  <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={async () => { try { await api.generations.update(item.id, { topic: editValue }); invalidate("generations.list"); setHistory(p => p.map(h => h.id === item.id ? { ...h, name: editValue } : h)); } catch (e) { console.error(e); } finally { setEditingId(null); } }} className="text-[13px] bg-transparent outline-none w-full font-bold" />
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold opacity-80 group-hover:opacity-100 truncate w-40">{item.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }} className="opacity-0 group-hover:opacity-100"><MoreVertical size={16}/></button>
                  </div>
                )}
                {activeMenu === item.id && (
                  <div className="absolute right-4 top-14 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-black dark:text-white">
                    <button onClick={() => { setEditingId(item.id); setEditValue(item.name); setActiveMenu(null); }} className="flex items-center gap-3 w-full p-4 text-[10px] hover:bg-slate-50 dark:hover:bg-zinc-700 transition font-black uppercase"><Edit3 size={14}/> {cur.edit}</button>
                    <button onClick={async () => { try { await api.generations.remove(item.id); invalidate("generations.list"); setHistory(h => h.filter(i => i.id !== item.id)); if (activeId === item.id) { setActiveId(null); setRes(""); } } catch (e) { console.error("delete failed", e); } finally { setActiveMenu(null); } }} className="flex items-center gap-3 w-full p-4 text-[10px] text-red-500 hover:bg-red-50 transition font-black uppercase"><Trash2 size={14}/> {cur.del}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-10 border-t border-slate-100 dark:border-zinc-800">
          <button onClick={async () => { await api.logout().catch(()=>{}); invalidate("me"); invalidatePrefixRaw("generations."); setUser(null); navigate("/");}} className="flex items-center gap-3 w-full p-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16}/> {cur.exit}
          </button>
        </div>
      </aside>      

      <main className="flex-1 flex flex-col xl:flex-row gap-4 md:gap-6 overflow-hidden">
        <section className="w-[480px] p-12 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto">    
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-blue-600">PLANNER</h2>
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className="w-full p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm appearance-none cursor-pointer">
                {[...Array(11)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Класс</option>)}
              </select>

              <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm appearance-none cursor-pointer">
                <option>45 Мин</option><option>60 Мин</option><option>90 Мин</option>
              </select>
            </div>
            
            <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder={cur.s} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-blue-500/10 transition-all" />
            <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder={cur.t} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-blue-500/10 transition-all" />
            <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} placeholder={cur.d} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold h-52 resize-none focus:ring-4 ring-blue-500/10 transition-all" />
            
            <button onClick={handleGenerate} disabled={loading || !form.subject || !form.topic} className={`w-full py-7 rounded-[28px] text-[15px] font-black uppercase tracking-[0.3em] transition-all border-[4px] border-black dark:border-white shadow-2xl ${!loading && form.subject && form.topic ? 'bg-blue-600 text-white hover:scale-[1.02] active:scale-95' : 'bg-slate-200 dark:bg-zinc-800 opacity-50 cursor-not-allowed'}`}>
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
};