import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  GraduationCap, FileText, Sun, Moon, 
  ChevronRight, MoreVertical, Edit3, Trash2, Eye, EyeOff 
} from 'lucide-react';
import api from './api';

const t = {
  RU: { 
    h: "ИСТОРИЯ", p: "ПАРАМЕТРЫ", r: "РЕЗУЛЬТАТ", s: "Предмет", t: "Тема", d: "Детали", g: "ГЕНЕРИРОВАТЬ", c: "КОПИРОВАТЬ", edit: "Изменить", del: "Удалить", grade: "Класс", dur: "Мин", placeholder: "Введите данные...", exit: "ВЫХОД",
    lt: { hero: "Планируйте уроки эффективно", sub: "Профессиональная система автоматизации учебных планов нового поколения.", login: "Войти", signup: "Регистрация", join: "Начать работу" },
    auth: { loginTitle: "С возвращением!", signupTitle: "Создать аккаунт", email: "ПОЧТА", pass: "ПАРОЛЬ", enter: "ВОЙТИ", switchL: "Нет аккаунта? Регистрация", switchS: "Уже есть аккаунт? Войти", errMail: "Неверный формат почты" }
  },
  KZ: { 
    h: "ТАРИХ", p: "ПАРАМЕТРЛЕР", r: "НӘТИЖЕ", s: "Пән", t: "Сабақ тақырыбы", d: "Мәліметтер", g: "ҚҰРАСТЫРУ", c: "КӨШІРУ", edit: "Өзгерту", del: "Өшіру", grade: "Сынып", dur: "Мин", placeholder: "Мәліметтерді енгізіңіз...", exit: "ШЫҒУ",
    lt: { hero: "Сабақты тиімді жоспарлаңыз", sub: "Оқу жоспарларын автоматты төрде құрастыруға арналған кәсіби жүйе.", login: "Кіру", signup: "Тіркелу", join: "Жұмысты бастау" },
    auth: { loginTitle: "Қош келдіңіз!", signupTitle: "Тіркелу", email: "ПОШТА", pass: "ҚҰПИЯ СӨЗ", enter: "КІРУ", switchL: "Тіркелмегенсіз бе? Тіркелу", switchS: "Аккаунтыңыз бар ма? Кіру", errMail: "Пошта форматы қате" }
  },
  EN: { 
    h: "HISTORY", p: "PARAMETERS", r: "RESULT", s: "Subject", t: "Topic", d: "Details", g: "GENERATE", c: "COPY", edit: "Edit", del: "Delete", grade: "Grade", dur: "Min", placeholder: "Enter details...", exit: "EXIT",
    lt: { hero: "Plan Lessons Effectively", sub: "Professional next-generation automated lesson planning system.", login: "Sign In", signup: "Sign Up", join: "Get Started" },
    auth: { loginTitle: "Welcome back!", signupTitle: "Create Account", email: "EMAIL", pass: "PASSWORD", enter: "ENTER", switchL: "Don't have an account? Sign Up", switchS: "Already have an account? Log In", errMail: "Invalid email format" }
  }
};

// --- УВЕЛИЧЕННЫЙ АБОБУС ---
const LanguageSwitcher = ({ lang, setLang }) => {
  // Новые позиции для увеличенного размера (шаг 42px)
  const positions = { KZ: '4px', RU: '46px', EN: '88px' };
  return (
    <div className="relative flex bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-full border border-slate-200 dark:border-zinc-700 w-[132px] h-[42px] items-center shrink-0 shadow-sm transition-all">
      <div 
        className="absolute h-[30px] w-[40px] bg-white dark:bg-zinc-500 rounded-full shadow-md transition-all duration-300 ease-in-out" 
        style={{ left: positions[lang] }} 
      />
      {["KZ", "RU", "EN"].map((l) => (
        <button 
          key={l} 
          onClick={() => setLang(l)} 
          className={`relative z-10 w-[40px] h-full text-[13px] font-black transition-colors duration-300 flex items-center justify-center ${lang === l ? 'text-blue-600 dark:text-white' : 'opacity-40 hover:opacity-100'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
};

// --- УВЕЛИЧЕННАЯ МОДАЛКА ---
const AuthModal = ({ isOpen, mode, setMode, onClose, email, setEmail, pass, setPass, isFormValid, navigate, setUser, isEmailValid, showEmailError, setShowEmailError, authT }) => {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-white/80 dark:bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-12 rounded-[44px] shadow-2xl relative text-black dark:text-white font-sans">
        <button onClick={onClose} className="absolute top-8 right-8 opacity-30 hover:opacity-100 font-bold text-2xl">✕</button>
        <h2 className="text-4xl font-black mb-10 tracking-tight">{mode === "login" ? authT.loginTitle : authT.signupTitle}</h2>
        <div className="space-y-6">
          <input value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setShowEmailError(true)} type="email" placeholder={authT.email} className={`w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-blue-500 transition ${showEmailError && !isEmailValid ? "border-red-500" : ""}`} />
          <div className="relative">
            <input value={pass} onChange={(e) => setPass(e.target.value)} type={showPass ? "text" : "password"} placeholder={authT.pass} className="w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-blue-500" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30">{showPass ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
          <button disabled={!isFormValid || loading} onClick={async () => {
            setLoading(true);
            try {
              if (mode === "signup") await api.signup(email, pass, null);
              await api.login(email, pass);
              const me = await api.me();
              setUser(me.user);
              onClose(); navigate("/dashboard");
            } catch { setErr("Auth Error"); } finally { setLoading(false); }
          }} className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all ${isFormValid && !loading ? "bg-blue-600 text-white shadow-lg" : "bg-slate-200 dark:bg-zinc-800 text-slate-400 opacity-50"}`}>{loading ? "..." : authT.enter}</button>
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-[12px] uppercase font-bold opacity-40 hover:opacity-100 block mx-auto mt-6 tracking-widest">{mode === "login" ? authT.switchL : authT.switchS}</button>
        </div>
      </div>
    </div>
  );
};

const LandingPage = ({ lang, setLang, setUser }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();
  const isFormValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && pass.length >= 8;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans overflow-x-hidden">
      {/* Абобус на лендинге ПОНИЖЕ */}
      <div className="fixed top-[52px] left-1/2 translate-x-[260px] z-[90]">
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>
      <AuthModal isOpen={isAuthOpen} mode={authMode} setMode={setAuthMode} onClose={() => setIsAuthOpen(false)} email={email} setEmail={setEmail} pass={pass} setPass={setPass} isFormValid={isFormValid} navigate={navigate} setUser={setUser} isEmailValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)} showEmailError={false} setShowEmailError={() => {}} authT={t[lang].auth} />
      <nav className="flex justify-between items-center px-12 py-10">
        <div className="font-black text-2xl italic tracking-tighter flex items-center gap-3 text-blue-600"><GraduationCap size={36} /> LESSON.LAB</div>
        <div className="flex gap-10 items-center font-black uppercase text-[13px] tracking-wider relative z-[10]">
          <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }} className="hover:text-blue-600 transition">{t[lang].lt.login}</button>
          <button onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }} className="px-12 py-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95">{t[lang].lt.signup}</button>
        </div>
      </nav>
      <header className="max-w-6xl mx-auto px-10 py-40 text-center relative z-0">
        <div className="inline-block px-5 py-2 mb-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-black tracking-[0.2em] uppercase border border-blue-100 dark:border-blue-800">✨ AI-POWERED EDUCATION</div>
        <h1 className="text-8xl font-black uppercase tracking-tight mb-12 leading-[1.05]">{t[lang].lt.hero}</h1>
        <p className="text-xl opacity-50 max-w-2xl mx-auto mb-20 font-medium leading-relaxed tracking-wide">{t[lang].lt.sub}</p>
        <button onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }} className="group inline-flex items-center gap-6 px-16 py-8 bg-slate-900 dark:bg-white text-white dark:text-black text-xl font-bold uppercase tracking-widest rounded-[32px] hover:bg-blue-600 transition-all shadow-2xl">{t[lang].lt.join} <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform"/></button>
      </header>
    </div>
  );
};

const Dashboard = ({ lang, setLang, setUser, dark, setDark }) => {
  const [form, setForm] = useState({ subject: "", topic: "", details: "", grade: "5", duration: "45" });
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([{ id: 1, name: "Sample Plan" }]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const cur = t[lang];

  const generate = async () => {
    if (!form.subject || !form.topic) return;
    setLoading(true); setRes("");
    setTimeout(() => {
      setRes(`### ${form.topic}\n\n**${cur.s}:** ${form.subject}\n**${cur.grade}:** ${form.grade}`);
      setHistory(prev => [{ id: Date.now(), name: form.topic }, ...prev]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-zinc-100 font-sans p-6 gap-6 relative overflow-hidden">
      <aside className="w-80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl rounded-[40px] border border-white/20 flex flex-col shadow-xl">
        <div className="p-10 flex justify-between items-center gap-4">
          <Link to="/" className="font-black text-xl italic tracking-tighter text-blue-600 shrink-0">LESSON.LAB</Link>
          <div className="flex gap-2">
            <button onClick={() => setDark(!dark)} className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:scale-110 transition">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button onClick={async () => { await api.logout(); setUser(null); }} className="px-4 py-2 bg-red-50 text-red-500 text-[9px] font-black uppercase rounded-2xl hover:bg-red-500 hover:text-white transition-all">{cur.exit}</button>
          </div>
        </div>
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="text-[10px] font-black opacity-30 mb-8 tracking-[0.3em] uppercase">{cur.h}</div>
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className={`group relative p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/40 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer ${editingId === item.id ? 'bg-blue-600 text-white' : ''}`}>
                {editingId === item.id ? (
                  <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setHistory(p => p.map(h => h.id === item.id ? { ...h, name: editValue } : h)), setEditingId(null))} onBlur={() => (setHistory(p => p.map(h => h.id === item.id ? { ...h, name: editValue } : h)), setEditingId(null))} className="text-[13px] bg-transparent outline-none w-full font-bold" />
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold opacity-80 group-hover:opacity-100 truncate w-40">{item.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }} className="opacity-0 group-hover:opacity-100"><MoreVertical size={16}/></button>
                  </div>
                )}
                {activeMenu === item.id && (
                  <div className="absolute right-4 top-14 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(item.id); setEditValue(item.name); setActiveMenu(null); }} className="flex items-center gap-3 w-full p-4 text-[10px] hover:bg-slate-50 dark:hover:bg-zinc-700 transition font-black uppercase text-black dark:text-white"><Edit3 size={14}/> {cur.edit}</button>
                    <button onClick={(e) => { e.stopPropagation(); setHistory(h => h.filter(i => i.id !== item.id)); setActiveMenu(null); }} className="flex items-center gap-3 w-full p-4 text-[10px] text-red-500 hover:bg-red-50 transition font-black uppercase"><Trash2 size={14}/> {cur.del}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
      <main className="flex-1 flex gap-6 overflow-hidden">
        <section className="w-[480px] p-12 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto text-slate-900 dark:text-white">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-blue-600">{cur.p}</h2>
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </div>
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-30 ml-2 uppercase">{cur.grade}</label>
                <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className="w-full p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm appearance-none cursor-pointer">
                  {[...Array(11)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-30 ml-2 uppercase">{cur.dur}</label>
                <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm appearance-none cursor-pointer"><option>45</option><option>60</option><option>90</option></select>
              </div>
            </div>
            <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder={cur.s} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-blue-500/10 transition-all" />
            <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder={cur.t} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-blue-500/10 transition-all" />
            <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} placeholder={cur.d} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold h-52 resize-none focus:ring-4 ring-blue-500/10 transition-all" />
            <button onClick={generate} disabled={loading || !form.subject || !form.topic} className={`w-full py-7 rounded-[28px] text-[15px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl border-[4px] border-black dark:border-white ${!loading && form.subject && form.topic ? 'bg-blue-600 text-white hover:scale-[1.02] active:scale-95' : 'bg-slate-200 dark:bg-zinc-800 opacity-50 cursor-not-allowed border-slate-300'}`}>{loading ? "..." : cur.g}</button>
          </div>
        </section>
        <section className="flex-1 p-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto">
          <div className="flex justify-between items-center mb-10 text-slate-900 dark:text-white">
            <h2 className="flex items-center gap-4 text-blue-600 font-black tracking-widest text-xs uppercase"><FileText size={24}/> {cur.r}</h2>
            {res && <button onClick={() => navigator.clipboard.writeText(res)} className="px-8 py-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all font-bold">Copy Result</button>}
          </div>
          <div className="prose dark:prose-invert max-w-none text-lg text-slate-700 dark:text-slate-300 leading-relaxed italic"><ReactMarkdown>{res || cur.placeholder}</ReactMarkdown></div>
        </section>
      </main>
    </div>
  );
};

const Protected = ({ user, children }) => user ? children : <Navigate to="/" replace />;

export default function App() {
  const [lang, setLang] = useState("RU");
  const [user, setUser] = useState(null);
  const [boot, setBoot] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => { (async () => { try { const r = await api.me(); setUser(r.user); } catch { setUser(null); } finally { setBoot(false); } })(); }, []);
  if (boot) return null;
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage lang={lang} setLang={setLang} setUser={setUser} />} />
        <Route path="/dashboard" element={<Protected user={user}><Dashboard lang={lang} setLang={setLang} setUser={setUser} dark={dark} setDark={setDark} /></Protected>} />
      </Routes>
    </Router>
  );
}