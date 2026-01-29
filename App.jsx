import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  GraduationCap, FileText, Sun, Moon, 
  ChevronRight, MoreVertical, Edit3, Trash2, Eye, EyeOff, User, LayoutGrid, Gamepad2, LogOut 
} from 'lucide-react';
import api from './api';

const t = {
  RU: { 
    h: "ИСТОРИЯ", p: "ПАРАМЕТРЫ", r: "РЕЗУЛЬТАТ", s: "Предмет", t: "Тема", d: "Детали", g: "ГЕНЕРИРОВАТЬ", edit: "Изменить", del: "Удалить", exit: "ВЫХОД",
    lt: { hero: "Планируйте уроки эффективно", sub: "Профессиональная система автоматизации учебных планов нового поколения.", login: "Войти", signup: "Регистрация", join: "Начать работу" },
    hub: { title: "Выберите направление", tools: "Инструменты", games: "Игротека (Скоро)", go: "Открыть" },
    prof: { title: "Мой Профиль", mail: "Почта", stats: "Статистика", back: "Назад в Хаб", edit: "Редактировать", empty: "Пустое пространство", save: "Сохранить", cancel: "Отмена" },
    auth: { loginTitle: "С возвращением!", signupTitle: "Создать аккаунт", email: "ПОЧТА", pass: "ПАРОЛЬ", enter: "ВОЙТИ", switchL: "Нет аккаунта? Регистрация", switchS: "Уже есть аккаунт? Войти" 
    }
  },
  KZ: { 
    h: "ТАРИХ", p: "ПАРАМЕТРЛЕР", r: "НӘТИЖЕ", s: "Пән", t: "Сабақ тақырыбы", d: "Мәліметтер", g: "ҚҰРАСТЫРУ", edit: "Өзгерту", del: "Өшіру", exit: "ШЫҒУ",
    lt: { hero: "Сабақты тиімді жоспарлаңыз", sub: "Оқу жоспарларын автоматты төрде құрастыруға арналған кәсіби жүйе.", login: "Кіру", signup: "Тіркелу", join: "Жұмысты бастау" },
    hub: { title: "Бағытты таңдаңыз", tools: "Құралдар", games: "Ойындар (Жақында)", go: "Ашу" },
    prof: { title: "Менің Профилім", mail: "Пошта", stats: "Статистика", back: "Хабқа қайту", edit: "Өңдеу", empty: "Бос орын", save: "Сақтау", cancel: "Бас тарту" }, 
    auth: { loginTitle: "Қош келдіңіз!", signupTitle: "Тіркелу", email: "ПОШТА", pass: "ҚҰПИЯ СӨЗ", enter: "КІРУ", switchL: "Тіркелмегенсіз бе? Тіркелу", switchS: "Аккаунтыңыз бар ма? Кіру" 
    }
  },
  EN: { 
    h: "HISTORY", p: "PARAMETERS", r: "RESULT", s: "Subject", t: "Topic", d: "Details", g: "GENERATE", edit: "Edit", del: "Delete", exit: "EXIT",
    lt: { hero: "Plan Lessons Effectively", sub: "Professional next-generation automated lesson planning system.", login: "Sign In", signup: "Sign Up", join: "Get Started" },
    hub: { title: "Choose Direction", tools: "Tools", games: "Games (Soon)", go: "Open" },
    prof: { title: "My Profile", mail: "Email", stats: "Statistics", back: "Back to Hub", edit: "Edit Profile", empty: "Empty Space", save: "Save", cancel: "Cancel" },
    auth: { loginTitle: "Welcome back!", signupTitle: "Create Account", email: "EMAIL", pass: "PASSWORD", enter: "ENTER", switchL: "Don't have an account? Sign Up", switchS: "Already have an account? Log In" 
    }
  }
};

const LanguageSwitcher = ({ lang, setLang }) => {
  const positions = { KZ: '4px', RU: '46px', EN: '88px' };
  return (
    <div className="relative flex bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-full border border-slate-200 dark:border-zinc-700 w-[132px] h-[42px] items-center shrink-0 shadow-sm transition-all">
      <div className="absolute h-[30px] w-[40px] bg-white dark:bg-zinc-500 rounded-full shadow-md transition-all duration-300 ease-in-out" style={{ left: positions[lang] || '46px' }} />
      {["KZ", "RU", "EN"].map((l) => (
        <button key={l} onClick={() => setLang(l)} className={`relative z-10 w-[40px] h-full text-[13px] font-black transition-colors duration-300 flex items-center justify-center ${lang === l ? 'text-blue-600 dark:text-white' : 'opacity-40 hover:opacity-100'}`}>
          {l}
        </button>
      ))}
    </div>
  );
};

const Footer = () => (
  <footer className="py-12 px-12 border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
    <div className="max-w-7xl mx-auto flex justify-between items-center opacity-40 text-[11px] font-black uppercase tracking-[0.2em]">
      <div>© 2026 LESSON.LAB / v1.0.4 STABLE VERSION</div>
    </div>
  </footer>
);

const AuthModal = ({ isOpen, mode, setMode, onClose, email, setEmail, pass, setPass, isFormValid, setUser, isEmailValid, showEmailError, setShowEmailError, lang = "RU" }) => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentLangData = t[lang] || t.RU;
  const authT = currentLangData.auth; 

  if (!isOpen) return null;

  const handleSubmit = async () => { 
    setLoading(true);
    try {
      if (mode === "signup") await api.signup(email, pass, null);
      await api.login(email, pass);
      const me = await api.me();
      setUser(me.user);
      onClose();
      navigate("/hub");
    } catch { 
      alert("Auth Error"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-white/80 dark:bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-12 rounded-[44px] shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 opacity-30 hover:opacity-100 font-bold text-2xl">✕</button>

        <h2 className="text-4xl font-black mb-10 tracking-tight text-slate-900 dark:text-white">
          {mode === "login" ? authT.loginTitle : authT.signupTitle}
        </h2>
        
        <div className="space-y-6">
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            onBlur={() => setShowEmailError(true)} 
            type="email" 
            placeholder={authT.email} 
            className={`w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-blue-500 transition ${showEmailError && !isEmailValid ? "border-red-500" : ""}`} 
          />
          
          <div className="relative">
            <input 
              value={pass} 
              onChange={(e) => setPass(e.target.value)} 
              type={showPass ? "text" : "password"} 
              placeholder={authT.pass} 
              className="w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-blue-500" 
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30">
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button 
            disabled={!isFormValid || loading} 
            onClick={handleSubmit} 
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all ${isFormValid && !loading ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-200 dark:bg-zinc-800 text-slate-400 opacity-50"}`}
          >
            {loading ? "..." : authT.enter}
          </button>
          
          <button 
            onClick={() => setMode(mode === "login" ? "signup" : "login")} 
            className="text-[12px] uppercase font-bold opacity-40 hover:opacity-100 block mx-auto mt-6 tracking-widest text-slate-900 dark:text-white"
          >
            {mode === "login" ? authT.switchL : authT.switchS}
          </button>
        </div>
      </div>
    </div>
  );
};

const HubPage = ({ lang, setLang, user, setUser }) => {
  const cur = t[lang]?.hub || t.RU.hub;
  const navigate = useNavigate();

  const content = {
    RU: {
      teacher: "ДЛЯ УЧИТЕЛЕЙ",
      teacherDesc: "Создание и автоматизация уроков, AI помощник, планы",
      student: "ДЛЯ УЧЕНИКОВ",
      studentDesc: "Обучающие игры, награды, прогресс (Скоро)",
    },
    KZ: {
      teacher: "МҰҒАЛІМДЕРГЕ",
      teacherDesc: "Сабақтарды құрастыру және автоматтандыру, AI көмекші",
      student: "ОҚУШЫЛАРҒА",
      studentDesc: "Оқу ойындары, марапаттар, прогресс (Жақында)",
    },
    EN: {
      teacher: "FOR TEACHERS",
      teacherDesc: "Lesson planning, automation, AI assistant",
      student: "FOR STUDENTS",
      studentDesc: "Learning games, rewards, student progress (Soon)",
    }
  };

  const hubT = content[lang] || content.RU;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px]">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-12 py-8 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="font-black text-3xl italic tracking-tighter flex items-center gap-3 text-blue-600">
          <GraduationCap size={40} /> LESSON.LAB
        </div>
        
        <div className="flex gap-8 items-center">
          <LanguageSwitcher lang={lang} setLang={setLang} /> 
          <Link to="/profile" className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border-2 border-black/10 hover:border-black">
            <User size={20} />
            <span className="font-black uppercase text-[11px] tracking-widest">Account</span>
          </Link>
          <button onClick={async () => { await api.logout().catch(()=>{}); setUser(null); navigate("/"); }} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition">
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-10 py-20 text-center">
        <h1 className="text-7xl font-black uppercase mb-24 tracking-tighter italic">{cur.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* TEACHER ZONE */}
          <Link to="/dashboard" className="group relative p-12 bg-white dark:bg-zinc-900 rounded-[50px] border-[4px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
            <div className="absolute -top-6 left-10 px-6 py-2 bg-blue-600 text-white font-black text-xs rounded-full border-2 border-black uppercase tracking-widest">
              {hubT.teacher}
            </div>
            <div className="flex justify-between items-start mb-10 text-blue-600">
              <LayoutGrid size={64} strokeWidth={2.5} />
              <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-3xl">
                <FileText size={32} />
              </div>
            </div>
            <h2 className="text-4xl font-black uppercase mb-4 text-left tracking-tight">{cur.tools}</h2>
            <p className="text-left text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8 max-w-[280px]">
              {hubT.teacherDesc}
            </p>
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-[0.2em] text-blue-600 group-hover:gap-4 transition-all italic">
              {cur.go} <ChevronRight size={20} strokeWidth={3}/>
            </div>
          </Link>

          {/* STUDENT ZONE */}
          <div className="relative p-12 bg-slate-100 dark:bg-zinc-950 rounded-[50px] border-[4px] border-dashed border-slate-300 dark:border-zinc-800 opacity-60">
            <div className="absolute -top-6 left-10 px-6 py-2 bg-slate-300 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 font-black text-xs rounded-full border-2 border-dashed border-slate-400 uppercase tracking-widest">
              {hubT.student}
            </div>
            <div className="flex justify-between items-start mb-10 text-slate-400">
              <Gamepad2 size={64} strokeWidth={2.5} />
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl">
                <GraduationCap size={32} />
              </div>
            </div>
            <h2 className="text-4xl font-black uppercase mb-4 text-left tracking-tight opacity-50">{cur.games}</h2>
            <p className="text-left text-slate-400 font-bold leading-relaxed mb-8 max-w-[280px]">
              {hubT.studentDesc}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ProfilePage = ({ lang, user }) => {
  const cur = t[lang]?.prof || t.RU.prof;
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : {
      firstName: "John",
      lastName: "Doe",
      username: "@Guest",
      avatar: "https://moyashkola.gosuslugi.ru/netcat_files/9/67/avatar_0.png"
    };
  });

  const [tempData, setTempData] = useState(profileData);

  const handleSave = () => {
    setProfileData(tempData);
    localStorage.setItem('user_profile', JSON.stringify(tempData));
    setIsEditOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white p-10 font-sans">
      <div className="max-w-[1300px] mx-auto mb-10">
        <Link to="/hub" className="inline-flex items-center gap-2 font-black uppercase text-[10px] hover:text-blue-600 transition tracking-widest">
          <ChevronRight size={14} className="rotate-180" /> {cur.back}
        </Link>
      </div>

      <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-72 shrink-0">
          <div className="w-full aspect-square bg-slate-200 dark:bg-zinc-800 border-[4px] border-black dark:border-white rounded-xl overflow-hidden mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <img src={profileData.avatar} alt="avatar" className="w-full h-full object-cover grayscale" />
          </div>
          <div className="space-y-1 mb-6">
            <h1 className="text-3xl font-black tracking-tighter leading-tight">{profileData.firstName} {profileData.lastName}</h1>
            <p className="text-xl opacity-40 font-bold tracking-tight">{profileData.username}</p>
          </div>
          <button 
            onClick={() => { setTempData(profileData); setIsEditOpen(true); }}
            className="w-full py-3 bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {cur.edit}
          </button>
        </div>

        <div className="flex-1 w-full h-[500px] bg-white dark:bg-zinc-900/30 border-[4px] border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] flex items-center justify-center border-dashed opacity-60">
           <p className="font-black uppercase text-[10px] tracking-[0.4em] opacity-10 italic">{cur.empty}</p>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white p-10 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-black uppercase mb-8 tracking-tighter">{cur.edit}</h2>
            <div className="space-y-5">
              <input value={tempData.firstName} onChange={(e) => setTempData({...tempData, firstName: e.target.value})} placeholder="First Name" className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-2 border-black rounded-xl font-bold outline-none" />
              <input value={tempData.lastName} onChange={(e) => setTempData({...tempData, lastName: e.target.value})} placeholder="Last Name" className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-2 border-black rounded-xl font-bold outline-none" />
              <input value={tempData.username} onChange={(e) => setTempData({...tempData, username: e.target.value})} placeholder="Username" className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-2 border-black rounded-xl font-bold outline-none text-blue-600" />
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsEditOpen(false)} className="flex-1 py-4 border-2 border-black rounded-xl font-black uppercase text-xs">{cur.cancel}</button>
                <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white border-2 border-black rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{cur.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-16"><Footer /></div>
    </div>
  );
};

const LandingPage = ({ lang, setLang, setIsAuthOpen }) => {
  const cur = t[lang]?.lt || t.RU.lt;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans overflow-x-hidden pt-[100px]">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-12 py-8 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="font-black text-3xl italic tracking-tighter flex items-center gap-3 text-blue-600">
          <GraduationCap size={40} /> LESSON.LAB
        </div>
        
        <div className="flex gap-10 items-center font-black uppercase text-[13px] tracking-wider">
          <LanguageSwitcher lang={lang} setLang={setLang} />
          <button onClick={() => setIsAuthOpen(true)} className="hover:text-blue-600 transition">
            {cur.login}
          </button>
          <button onClick={() => setIsAuthOpen(true)} className="px-12 py-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95">
            {cur.signup}
          </button>
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-10 py-32 text-center">
        <div className="inline-block px-5 py-2 mb-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-black tracking-[0.2em] uppercase border border-blue-100 dark:border-blue-800">
          ✨ AI-POWERED EDUCATION
        </div>
        <h1 className="text-8xl font-black uppercase tracking-tight mb-12 leading-[1.05] tracking-tighter">
          {cur.hero}
        </h1>
        <p className="text-2xl opacity-50 max-w-2xl mx-auto mb-20 font-medium leading-relaxed">
          {cur.sub}
        </p>
        
        <button onClick={() => setIsAuthOpen(true)} className="group inline-flex items-center gap-6 px-16 py-8 bg-slate-900 dark:bg-white text-white dark:text-black text-xl font-bold uppercase tracking-widest rounded-[32px] hover:bg-blue-600 hover:text-white transition-all shadow-2xl">
          {cur.join} <ChevronRight size={28} />
        </button>
      </header>

      <Footer />
    </div>
  );
};

const Dashboard = ({ lang, setLang, user, setUser, dark, setDark }) => {
  const [form, setForm] = useState({ subject: "", topic: "", details: "", grade: "5", duration: "45" });
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([{ id: 1, name: "Sample Plan" }]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const cur = t[lang] || t.RU;

  const handleGenerate = async () => {
    if (!form.subject || !form.topic) return;

    setLoading(true);
    setRes(""); // Очищаем для эффекта новой печати

    const promptText = `Ты — профессиональный методист. Составь подробный план урока на языке ${lang}. 
    Предмет: ${form.subject}, Тема: ${form.topic}, Класс: ${form.grade}, 
    Время: ${form.duration} мин. Детали: ${form.details}. Используй Markdown.`;

    try {
      // Твой актуальный ключ из запроса
      const API_KEY = "AIzaSyBZ61oYbz9VadlP0vsUgGjM7VDZhsM7Fg0";
      // Используем v1beta для стриминга Gemini 2.0 Flash
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${API_KEY}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      });

      if (!response.ok) {
        // ⚠️ иногда body может быть не-JSON, поэтому try/catch
        let msg = "Ошибка API";
        try {
          const errorData = await response.json();
          msg = errorData?.error?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      // На всякий случай (в некоторых окружениях streaming может быть недоступен)
      if (!response.body) {
        const txt = await response.text().catch(() => "");
        throw new Error(txt || "Streaming response.body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      // Читаем поток чанков от Gemini
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Стриминг возвращает текст внутри JSON-структур. Разбиваем и ищем части текста.
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.includes('"text":')) {
            const match = line.match(/"text":\s*"(.*)"/);
            if (match && match[1]) {
              // Обрабатываем спецсимволы и переносы
              const cleanChunk = match[1]
                .replace(/\\n/g, "\n")
                .replace(/\\"/g, '"')
                .replace(/\\t/g, "\t");

              accumulatedText += cleanChunk;
              setRes(accumulatedText); // Обновляем блок "Результат" в реальном времени
            }
          }
        }
      }

      // Сохраняем в историю после завершения (как было)
      setHistory((prev) => [{ id: Date.now(), name: form.topic }, ...prev]);
    } catch (error) {
      console.error("Ошибка генерации:", error);

      const message = String(error?.message || "");
      const msg = message.includes("429")
        ? "Лимиты исчерпаны. Подождите 60 секунд."
        : message || "Unknown error";

      setRes(`## Ошибка\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-zinc-100 font-sans p-6 gap-6 relative overflow-hidden">
      <aside className="w-80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl rounded-[40px] border border-white/20 flex flex-col shadow-xl">
        <div className="p-10 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <Link to="/hub" className="font-black text-xl italic tracking-tighter text-blue-600">
              LESSON.LAB
            </Link>
            <button onClick={() => setDark(!dark)} className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm transition-all hover:scale-110">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="text-[10px] font-black opacity-30 mb-8 tracking-[0.3em] uppercase">{cur.h}</div>
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="group relative p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/40 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer">
                {editingId === item.id ? (
                  <input 
                    autoFocus 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)} 
                    onBlur={() => { setHistory(p => p.map(h => h.id === item.id ? { ...h, name: editValue } : h)); setEditingId(null); }} 
                    className="text-[13px] bg-transparent outline-none w-full font-bold" 
                  />
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold opacity-80 group-hover:opacity-100 truncate w-40">{item.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }} className="opacity-0 group-hover:opacity-100">
                      <MoreVertical size={16}/>
                    </button>
                  </div>
                )}
                {activeMenu === item.id && (
                  <div className="absolute right-4 top-14 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-black dark:text-white">
                    <button onClick={() => { setEditingId(item.id); setEditValue(item.name); setActiveMenu(null); }} className="flex items-center gap-3 w-full p-4 text-[10px] hover:bg-slate-50 dark:hover:bg-zinc-700 transition font-black uppercase">
                      <Edit3 size={14}/> {cur.edit}
                    </button>
                    <button onClick={() => { setHistory(h => h.filter(i => i.id !== item.id)); setActiveMenu(null); }} className="flex items-center gap-3 w-full p-4 text-[10px] text-red-500 hover:bg-red-50 transition font-black uppercase">
                      <Trash2 size={14}/> {cur.del}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-10 border-t border-slate-100 dark:border-zinc-800">
          <button onClick={async () => { await api.logout().catch(()=>{}); setUser(null); }} className="flex items-center gap-3 w-full p-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16}/> {cur.exit}
          </button>
        </div>
      </aside>      
      <main className="flex-1 flex gap-6 overflow-hidden">
        <section className="w-[480px] p-12 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-blue-600">{cur.p}</h2>
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </div>
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className="w-full p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm appearance-none cursor-pointer">
                {[...Array(11)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
              </select>
              <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full p-5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border-none font-bold text-sm appearance-none cursor-pointer"><option>45</option><option>60</option><option>90</option></select>
            </div>
            <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder={cur.s} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-blue-500/10 transition-all" />
            <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder={cur.t} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold focus:ring-4 ring-blue-500/10 transition-all" />
            <textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} placeholder={cur.d} className="w-full p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl outline-none text-sm font-bold h-52 resize-none focus:ring-4 ring-blue-500/10 transition-all" />
            <button onClick={handleGenerate} disabled={loading || !form.subject || !form.topic} className={`w-full py-7 rounded-[28px] text-[15px] font-black uppercase tracking-[0.3em] transition-all border-[4px] border-black dark:border-white shadow-2xl ${!loading && form.subject && form.topic ? 'bg-blue-600 text-white hover:scale-[1.02] active:scale-95' : 'bg-slate-200 dark:bg-zinc-800 opacity-50 cursor-not-allowed'}`}>{loading ? "..." : cur.g}</button>
          </div>
        </section>
        <section className="flex-1 p-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[40px] shadow-2xl border border-white/20 overflow-y-auto">
          <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed italic"><ReactMarkdown>{res || "..."}</ReactMarkdown></div>
        </section>
      </main>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || "RU");
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  // Сохраняем язык в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => { 
    document.documentElement.classList.toggle('dark', dark); 
    localStorage.setItem('theme', dark ? 'dark' : 'light'); 
  }, [dark]);

  useEffect(() => { 
    (async () => { 
      try { 
        const r = await api.me(); 
        setUser(r.user); 
      } catch { 
        setUser(null); 
      } 
    })(); 
  }, []);

  return (
    <Router>
      <AuthModal 
        isOpen={isAuthOpen} 
        mode={authMode} 
        setMode={setAuthMode} 
        onClose={() => setIsAuthOpen(false)} 
        email={email} 
        setEmail={setEmail} 
        pass={pass} 
        setPass={setPass} 
        isFormValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && pass.length >= 8} 
        setUser={setUser} 
        isEmailValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)} 
        showEmailError={showEmailError} 
        setShowEmailError={setShowEmailError} 
        lang={lang} 
      />
      
      <Routes>
        <Route path="/" element={<LandingPage lang={lang} setLang={setLang} setIsAuthOpen={setIsAuthOpen} />} />
        <Route path="/hub" element={user ? <HubPage lang={lang} setLang={setLang} user={user} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={user ? <Dashboard lang={lang} setLang={setLang} user={user} setUser={setUser} dark={dark} setDark={setDark} /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <ProfilePage lang={lang} user={user} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}