import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  GraduationCap, FileText, Sun, Moon, 
  ChevronRight, MoreVertical, Edit3, Trash2, Users, Zap, ShieldCheck,
  Eye, EyeOff 
} from 'lucide-react';
import api from './api';

const t = {
  RU: { 
    h: "ИСТОРИЯ", p: "ПАРАМЕТРЫ", r: "РЕЗУЛЬТАТ", s: "Предмет", t: "Тема", d: "Детали", g: "ГЕНЕРИРОВАТЬ", c: "КОПИРОВАТЬ", edit: "Изменить", del: "Удалить", grade: "Класс", dur: "Мин", placeholder: "Введите данные...",
    lt: { hero: "Планируйте уроки эффективно", sub: "Профессиональная система автоматизации учебных планов нового поколения.", join: "Начать работу", feat1: "Адаптивность", feat1d: "Поддержка любых возрастных групп.", feat2: "Методология", feat2d: "Соответствие стандартам.", feat3: "Скорость", feat3d: "Генерация за миллисекунды.", login: "Войти", signup: "Регистрация" }
  },
  KZ: { 
    h: "ТАРИХ", p: "ПАРАМЕТРЛЕР", r: "НӘТИЖЕ", s: "Пән", t: "Сабақ тақырыбы", d: "Мәліметтер", g: "ҚҰРАСТЫРУ", c: "КӨШІРУ", edit: "Өзгерту", del: "Өшіру", grade: "Сынып", dur: "Мин", placeholder: "Мәліметтерді енгізіңіз...",
    lt: { hero: "Сабақты тиімді жоспарлаңыз", sub: "Оқу жоспарларын автоматты түрде құрастыруға арналған кәсіби жүйе.", join: "Жұмысты бастау", feat1: "Адаптивтілік", feat1d: "Кез келген жас тобына арналған.", feat2: "Әдістеме", feat2d: "Заманауи стандарттарға сай.", feat3: "Жылдамдық", feat3d: "Миллисекунд ішінде генерация.", login: "Кіру", signup: "Тіркелу" }
  },
  EN: { 
    h: "HISTORY", p: "PARAMETERS", r: "RESULT", s: "Subject", t: "Topic", d: "Details", g: "GENERATE", c: "COPY", edit: "Edit", del: "Delete", grade: "Grade", dur: "Min", placeholder: "Enter details...",
    lt: { hero: "Plan Lessons Effectively", sub: "Professional next-generation automated lesson planning system.", join: "Get Started", feat1: "Adaptive", feat1d: "Support for any age group.", feat2: "Methodology", feat2d: "Standard compliant.", feat3: "Instant", feat3d: "Generation in milliseconds.", login: "Sign In", signup: "Sign Up" }
  }
};

// --- AUTH MODAL ---
const AuthModal = ({
  isOpen, mode, setMode, onClose, email, setEmail, pass, setPass,
  isFormValid, navigate, setUser, isEmailValid, showEmailError, setShowEmailError
}) => {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const close = () => { setErr(""); setShowEmailError(false); onClose(); };
  const switchMode = () => { setErr(""); setShowEmailError(false); setMode(mode === "login" ? "signup" : "login"); };

  const submit = async () => {
    setShowEmailError(true);
    if (!isFormValid || loading) return;
    setErr(""); setLoading(true);
    try {
      if (mode === "signup") await api.signup(email, pass, null);
      await api.login(email, pass);
      const me = await api.me();
      setUser(me.user);
      close();
      navigate("/dashboard");
    } catch (e) {
      if (e?.status === 409) setErr("Email already exists");
      else if (e?.status === 401) setErr("Wrong email or password");
      else setErr(e?.message || "Server error");
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)] relative text-black dark:text-white">
        <button onClick={close} className="absolute top-4 right-4 font-black text-xl">✕</button>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 italic">{mode === "login" ? "Welcome back!" : "Create Account!"}</h2>
        <div className="space-y-6">
          <input
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (err) setErr(""); }}
            onBlur={() => setShowEmailError(true)}
            onFocus={() => setShowEmailError(false)}
            type="email" placeholder="EMAIL"
            className={`w-full p-4 bg-transparent border-b-2 outline-none font-bold text-xs border-black dark:border-white ${showEmailError && !isEmailValid ? "border-red-500" : ""}`}
          />
          {showEmailError && !isEmailValid && <div className="text-[10px] text-red-500 font-bold uppercase">Invalid email format</div>}
          <div className="relative">
            <input value={pass} onChange={(e) => { setPass(e.target.value); if (err) setErr(""); }} type={showPass ? "text" : "password"} placeholder="PASSWORD" className="w-full p-4 bg-transparent border-b-2 border-black dark:border-white outline-none font-bold text-xs" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <button disabled={!isFormValid || loading} onClick={submit} className={`block w-full py-5 font-black uppercase tracking-widest mt-6 ${isFormValid && !loading ? "bg-black dark:bg-white text-white dark:text-black hover:invert shadow-lg" : "bg-slate-200 dark:bg-zinc-800 text-slate-400 opacity-50"}`}>
            {loading ? "..." : "ENTER"}
          </button>
          {err && <div className="text-[10px] mt-2 text-red-500 font-bold uppercase">{err}</div>}
          <button onClick={switchMode} className="text-[9px] uppercase font-black opacity-30 hover:opacity-100 block mx-auto mt-4 tracking-widest">{mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}</button>
        </div>
      </div>
    </div>
  );
};

const Protected = ({ user, children }) => { if (!user) return <Navigate to="/" replace />; return children; };

// --- LANDING PAGE ---
const LandingPage = ({ lang, setLang, setUser, dark, setDark }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const navigate = useNavigate();
  const cur = t[lang].lt;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isEmailValid && pass.length >= 8;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-mono transition-colors duration-300">
      <AuthModal isOpen={isAuthOpen} mode={authMode} setMode={setAuthMode} onClose={() => setIsAuthOpen(false)} email={email} setEmail={setEmail} pass={pass} setPass={setPass} isFormValid={isFormValid} navigate={navigate} setUser={setUser} isEmailValid={isEmailValid} showEmailError={showEmailError} setShowEmailError={setShowEmailError} />
      <nav className="flex justify-between items-center px-10 py-6 border-b border-slate-200 dark:border-zinc-800 font-bold uppercase text-[10px]">
        <div className="font-black text-xl italic tracking-tighter flex items-center gap-2"><GraduationCap /> LESSON.LAB</div>
        <div className="flex gap-10 items-center">
          <div className="flex border border-black dark:border-white">
            {["KZ", "RU", "EN"].map(l => (<button key={l} onClick={() => setLang(l)} className={`w-8 py-1 text-[8px] ${lang === l ? 'bg-black dark:bg-white text-white dark:text-black' : ''}`}>{l}</button>))}
          </div>
          <div className="w-[200px] flex justify-end gap-6 items-center">
            <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="opacity-40 hover:opacity-100 tracking-widest uppercase">{cur.login}</button>
            <button onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }} className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white hover:invert transition tracking-widest text-[9px] uppercase">{cur.signup}</button>
          </div>
        </div>
      </nav>
      <header className="max-w-5xl mx-auto px-10 py-40 text-center">
        <h1 className="text-7xl font-black uppercase tracking-tighter mb-12 leading-[1.2]">{cur.hero.split(' ').map((w, i) => i === 2 ? <span key={i} className="bg-black text-white dark:bg-white dark:text-black px-4 italic inline-block my-2">{w} </span> : w + ' ')}</h1>
        <p className="text-[11px] opacity-40 max-w-sm mx-auto mb-16 uppercase tracking-[0.2em]">{cur.sub}</p>
        <button onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }} className="inline-flex items-center gap-4 px-12 py-6 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] hover:invert transition-all border-2 border-black dark:border-white shadow-xl">{cur.join} <ChevronRight size={20} /></button>
      </header>
    </div>
  );
};

// --- DASHBOARD ---
const Dashboard = ({ lang, setLang, user, setUser, dark, setDark }) => {
  const [form, setForm] = useState({ subject: "", topic: "", details: "", grade: "5-9", duration: "45" });
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([{ id: 1, name: "Sample Plan" }]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const cur = t[lang];

  useEffect(() => {
    if (activeMenu === null) return;
    const onDocClick = () => setActiveMenu(null);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [activeMenu]);

  const generate = async () => {
    if (!form.subject || !form.topic) return;
    setLoading(true); setRes("");
    setTimeout(() => {
      setRes(`### Plan: ${form.topic}\n\n**Subject:** ${form.subject}\n**Grade:** ${form.grade}\n\n*Generated via Lesson.Lab*`);
      setHistory(prev => [{ id: Date.now(), name: form.topic }, ...prev]);
      setLoading(false);
    }, 1500);
  };

  const saveEdit = (id) => { setHistory(prev => prev.map(h => h.id === id ? { ...h, name: editValue } : h)); setEditingId(null); };

  return (
    <div className="flex h-screen bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono transition-colors duration-300">
      <aside className="w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
          <Link to="/" className="font-black text-sm italic tracking-tighter">LESSON.LAB</Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)} className="p-1.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition">{dark ? <Sun size={14} /> : <Moon size={14} />}</button>
            <button onClick={async () => { await api.logout().catch(()=>{}); setUser(null); }} className="p-1.5 border border-red-500 text-red-500 text-[8px] font-black uppercase hover:bg-red-500 hover:text-white transition">Exit</button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="text-[9px] font-bold opacity-30 mb-4 tracking-[0.3em] uppercase">{cur.h}</div>
          <div className="space-y-1">
            {history.map((item) => (
              <div key={item.id} className="group relative flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-800">
                {editingId === item.id ? (
                  <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)} onBlur={() => saveEdit(item.id)} className="text-[11px] bg-transparent outline-none w-full" />
                ) : (
                  <><span className="text-[11px] truncate w-40 opacity-70 italic">{item.name}</span><button onClick={(e) => { e.stopPropagation(); setActiveMenu(prev => prev === item.id ? null : item.id); }} className="opacity-0 group-hover:opacity-100"><MoreVertical size={14} /></button></>
                )}
                {activeMenu === item.id && (
                  <div className="absolute right-0 top-8 w-32 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 z-50 shadow-xl font-bold">
                    <button onClick={() => { setEditingId(item.id); setEditValue(item.name); setActiveMenu(null); }} className="w-full p-2 text-[10px] text-left hover:bg-slate-50 dark:hover:bg-zinc-800">{cur.edit}</button>
                    <button onClick={() => { setHistory(p => p.filter(h => h.id !== item.id)); setActiveMenu(null); }} className="w-full p-2 text-[10px] text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">{cur.del}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
      <main className="flex-1 flex overflow-hidden">
        <section className="w-[400px] border-r border-slate-200 dark:border-zinc-800 p-8 bg-white dark:bg-zinc-950 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40">{cur.p}</h2>
            <div className="flex border border-black dark:border-white">
              {["KZ", "RU", "EN"].map(l => (<button key={l} onClick={() => setLang(l)} className={`w-8 py-1 text-[8px] ${lang === l ? 'bg-black dark:bg-white text-white dark:text-black' : ''}`}>{l}</button>))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className="w-full p-2.5 bg-transparent border-b border-black dark:border-white outline-none text-[11px] appearance-none"><option className="dark:bg-zinc-900">1-4</option><option className="dark:bg-zinc-900">5-9</option><option className="dark:bg-zinc-900">10-11</option></select>
              <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full p-2.5 bg-transparent border-b border-black dark:border-white outline-none text-[11px] appearance-none"><option className="dark:bg-zinc-900">45</option><option className="dark:bg-zinc-900">60</option><option className="dark:bg-zinc-900">90</option></select>
            </div>
            <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder={cur.s} className="w-full p-3 text-[11px] bg-transparent border-b border-black dark:border-white outline-none uppercase" />
            <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder={cur.t} className="w-full p-3 text-[11px] bg-transparent border-b border-black dark:border-white outline-none uppercase" />
            <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} placeholder={cur.d} className="w-full p-3 text-[11px] bg-transparent border-b border-black dark:border-white outline-none h-40 resize-none uppercase" />
            <button onClick={generate} disabled={loading || !form.subject || !form.topic} className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] ${!loading && form.subject && form.topic ? 'bg-black dark:bg-white text-white dark:text-black hover:invert shadow-lg' : 'bg-slate-200 dark:bg-zinc-800 opacity-50'}`}>{loading ? "..." : cur.g}</button>
          </div>
        </section>
        <section className="flex-1 p-10 bg-slate-50/50 dark:bg-black flex flex-col font-mono overflow-hidden">
          <div className="flex justify-between items-center mb-6 font-black uppercase text-[10px]">
            <h2 className="flex items-center gap-2 italic"><FileText size={14}/> {cur.r}</h2>
            {res && <button onClick={() => navigator.clipboard.writeText(res)} className="px-4 py-1.5 border border-black dark:border-white hover:invert transition uppercase font-bold">Copy</button>}
          </div>
          <div className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.03)] dark:shadow-none overflow-y-auto italic">
            {loading ? <div className="animate-pulse opacity-30 text-[10px] uppercase">Syncing...</div> : <div className="prose dark:prose-invert prose-sm text-xs opacity-80"><ReactMarkdown>{res || cur.placeholder}</ReactMarkdown></div>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState("RU");
  const [user, setUser] = useState(null);
  const [boot, setBoot] = useState(true);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
  const root = window.document.documentElement;
  requestAnimationFrame(() => {
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  });
}, [dark]);

  useEffect(() => {
    (async () => {
      try { const r = await api.me(); setUser(r.user); }
      catch { setUser(null); }
      finally { setBoot(false); }
    })();
  }, []);

  if (boot) return null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage lang={lang} setLang={setLang} setUser={setUser} dark={dark} setDark={setDark} />} />
        <Route path="/dashboard" element={<Protected user={user}><Dashboard lang={lang} setLang={setLang} user={user} setUser={setUser} dark={dark} setDark={setDark} /></Protected>} />
      </Routes>
    </Router>
  );
}