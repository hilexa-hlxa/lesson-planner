import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Copy, Check, Users, Clock } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { SkeletonCardGrid } from "../components/Skeleton";
import api from "../api";

const T = {
  RU: { title: "МОИ КЛАССЫ", create: "Создать класс", placeholder: "Название класса (напр. 7Б)", btn: "Создать", students: "учеников", pending: "ожидают", empty: "Классов пока нет. Создайте первый.", copied: "Скопировано!" },
  KZ: { title: "МЕНІҢ СЫНЫПТАРЫМ", create: "Сынып құру", placeholder: "Сынып атауы (мыс. 7Б)", btn: "Құру", students: "оқушы", pending: "күтуде", empty: "Әзірге сынып жоқ. Бірінші сыныпты жасаңыз.", copied: "Көшірілді!" },
  EN: { title: "MY CLASSES", create: "Create Class", placeholder: "Class name (e.g. 7B)", btn: "Create", students: "students", pending: "pending", empty: "No classes yet. Create your first one.", copied: "Copied!" },
};

export default function ClassesPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    api.classes.list()
      .then(r => setClasses(r.items || []))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const r = await api.classes.create(name.trim());
      setClasses(prev => [r.class, ...prev]);
      setName("");
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (e, cls) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cls.join_code);
    setCopiedId(cls.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-5xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="p-2.5 sm:p-3 bg-black text-white dark:bg-white dark:text-black rounded-2xl shrink-0">
              <Users className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-emerald-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shrink-0"
          >
            <Plus size={18} strokeWidth={3} /> {t.create}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-8 flex flex-col sm:flex-row gap-3">
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              maxLength={100}
              className="flex-1 px-5 py-3 border-4 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-black uppercase rounded-2xl border-4 border-black dark:border-white disabled:opacity-40 transition-opacity"
            >
              {t.btn}
            </button>
          </form>
        )}

        {loading ? (
          <SkeletonCardGrid count={4} />
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 sm:py-20 px-6 rounded-[32px] border-4 border-dashed border-black/10 dark:border-white/10">
            <div className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-3xl mb-5 text-slate-500 dark:text-slate-400">
              <Users size={36} />
            </div>
            <p className="text-slate-500 dark:text-zinc-400 font-bold text-lg max-w-sm mb-6">{t.empty}</p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <Plus size={16} strokeWidth={3} /> {t.create}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map(cls => (
              <div
                key={cls.id}
                onClick={() => navigate(`/classes/${cls.id}`)}
                className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-[32px] border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all p-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">{cls.name}</h2>
                  {cls.pending_count > 0 && (
                    <span className="ml-2 px-3 py-1 bg-orange-500 text-white text-xs font-black rounded-full border-2 border-black shrink-0">
                      {cls.pending_count} {t.pending}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">Code:</span>
                  <span className="font-mono font-black text-2xl tracking-widest">{cls.join_code}</span>
                  <button
                    onClick={e => copyCode(e, cls)}
                    className="ml-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    title={t.copied}
                  >
                    {copiedId === cls.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-500 dark:text-slate-400" />}
                  </button>
                </div>

                <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                  <span className="flex items-center gap-1"><Users size={14} /> {cls.member_count || 0} {t.students}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {new Date(cls.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
}
