import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserCheck, Trash2, Users, BookOpen, BarChart2, Copy, Check, ChevronLeft } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Skeleton, SkeletonRows } from "../components/Skeleton";
import api from "../api";

const T = {
  RU: { back: "Назад", members: "Ученики", quizzes: "Тесты", pending: "Ожидают одобрения", approved: "Одобренные ученики", approveAll: "Одобрить всех", approve: "Одобрить", kick: "Удалить", kickConfirm: "Удалить этого ученика из класса?", noMembers: "Нет учеников.", noQuizzes: "Нет тестов в этом классе. Запустите тест и выберите этот класс.", avgScore: "Средний балл", results: "результатов", code: "Код класса", copied: "Скопировано!", loadError: "Не удалось загрузить класс. Возможно, он был удалён." },
  KZ: { back: "Артқа", members: "Оқушылар", quizzes: "Тесттер", pending: "Мақұлдауды күтуде", approved: "Мақұлданған оқушылар", approveAll: "Барлығын мақұлдау", approve: "Мақұлдау", kick: "Жою", kickConfirm: "Бұл оқушыны сыныптан жою керек пе?", noMembers: "Оқушылар жоқ.", noQuizzes: "Бұл сыныпта тест жоқ. Тест іске қосып, осы сыныпты таңдаңыз.", avgScore: "Орташа балл", results: "нәтиже", code: "Сынып коды", copied: "Көшірілді!", loadError: "Сыныпты жүктеу мүмкін болмады. Ол жойылған болуы мүмкін." },
  EN: { back: "Back", members: "Students", quizzes: "Quizzes", pending: "Awaiting Approval", approved: "Approved Students", approveAll: "Approve All", approve: "Approve", kick: "Remove", kickConfirm: "Remove this student from the class?", noMembers: "No students yet.", noQuizzes: "No quizzes linked to this class. Start a quiz and select this class.", avgScore: "Avg Score", results: "results", code: "Class Code", copied: "Copied!", loadError: "Could not load this class. It may have been deleted." },
};

export default function ClassDetailPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const { id } = useParams();
  const navigate = useNavigate();

  const [cls, setCls] = useState(null);
  const [members, setMembers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [tab, setTab] = useState("members");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      api.classes.get(id),
      api.classes.getMembers(id),
      api.classes.getQuizzes(id),
    ]).then(([clsRes, membersRes, quizzesRes]) => {
      setCls(clsRes.class);
      setMembers(membersRes.members || []);
      setQuizzes(quizzesRes.quizzes || []);
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async (studentId) => {
    await api.classes.approve(id, studentId);
    setMembers(prev => prev.map(m => m.student_id === studentId ? { ...m, status: 'approved' } : m));
  };

  const handleApproveAll = async () => {
    await api.classes.approveAll(id);
    setMembers(prev => prev.map(m => ({ ...m, status: 'approved' })));
  };

  const handleKick = async (studentId, displayName) => {
    if (!window.confirm(`${t.kickConfirm}\n${displayName}`)) return;
    await api.classes.kick(id, studentId);
    setMembers(prev => prev.filter(m => m.student_id !== studentId));
  };

  const copyCode = () => {
    if (!cls) return;
    navigator.clipboard.writeText(cls.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const studentName = m => m.first_name ? `${m.first_name} ${m.last_name || ""}`.trim() : m.display_name || m.email;

  const pending = members.filter(m => m.status === 'pending');
  const approved = members.filter(m => m.status === 'approved');

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />
      <main id="main-content" className="max-w-4xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
        <Skeleton className="h-5 w-24 mb-8" />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <Skeleton className="h-12 w-56" />
          <Skeleton className="h-14 w-52 rounded-2xl" />
        </div>
        <div className="flex gap-2 mb-8">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
        <SkeletonRows count={4} />
      </main>
    </div>
  );

  if (error || !cls) return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />
      <main className="max-w-4xl mx-auto px-5 sm:px-6 py-16 text-center">
        <p className="text-slate-500 dark:text-zinc-400 font-bold text-lg mb-6">{t.loadError}</p>
        <button
          onClick={() => navigate('/classes')}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl border-[3px] border-black font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          {t.back}
        </button>
      </main>
      <Footer lang={lang} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-4xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
        <button onClick={() => navigate('/classes')} className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ChevronLeft size={20} /> {t.back}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words min-w-0">{cls?.name}</h1>
          {cls?.join_code && (
            <button onClick={copyCode} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-zinc-900 border-4 border-black dark:border-white rounded-2xl shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">{t.code}:</span>
              <span className="font-mono font-black text-2xl tracking-widest">{cls.join_code}</span>
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-slate-500 dark:text-slate-400" />}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: "members", label: t.members, icon: <Users size={16} /> },
            { key: "quizzes", label: t.quizzes, icon: <BookOpen size={16} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest border-2 transition-all ${tab === key ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'border-black/20 dark:border-white/20 text-slate-500 hover:border-black dark:hover:border-white'}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Members Tab */}
        {tab === "members" && (
          <div className="space-y-8">
            {pending.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-xl uppercase tracking-wide flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                    {t.pending} ({pending.length})
                  </h2>
                  {pending.length > 1 && (
                    <button onClick={handleApproveAll} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-black uppercase rounded-xl border-2 border-black hover:bg-green-700 transition-colors">
                      <UserCheck size={14} /> {t.approveAll}
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {pending.map(m => (
                    <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border-2 border-orange-200 dark:border-orange-800">
                      <div>
                        <div className="font-black">{studentName(m)}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm">{m.email}{m.phone ? ` · ${m.phone}` : ''}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(m.student_id)} className="px-4 py-2 bg-green-600 text-white text-xs font-black uppercase rounded-xl border-2 border-black hover:bg-green-700 transition-colors">
                          {t.approve}
                        </button>
                        <button onClick={() => handleKick(m.student_id, studentName(m))} className="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-600 text-xs font-black uppercase rounded-xl border-2 border-red-200 dark:border-red-800 hover:bg-red-200 transition-colors">
                          {t.kick}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="font-black text-xl uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                {t.approved} ({approved.length})
              </h2>
              {approved.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 font-bold">{t.noMembers}</p>
              ) : (
                <div className="space-y-3">
                  {approved.map(m => (
                    <div key={m.id} className="flex items-center justify-between gap-3 px-5 py-4 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-black/10 dark:border-white/10">
                      <div>
                        <div className="font-black">{studentName(m)}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm">{m.email}{m.phone ? ` · ${m.phone}` : ''}</div>
                      </div>
                      <button onClick={() => handleKick(m.student_id, studentName(m))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Quizzes Tab */}
        {tab === "quizzes" && (
          <div>
            {quizzes.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 font-bold py-8">{t.noQuizzes}</p>
            ) : (
              <div className="space-y-4">
                {quizzes.map(q => (
                  <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-5 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-black/10 dark:border-white/10">
                    <div>
                      <div className="font-black text-lg">{q.topic}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-sm font-bold">{q.subject} · {new Date(q.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-6 text-right shrink-0">
                      <div className="text-slate-500 text-sm font-bold">{q.result_count} {t.results}</div>
                      <div className="flex items-center gap-1 font-black text-lg">
                        <BarChart2 size={16} className="text-emerald-500" />
                        {Math.round(q.avg_score)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
}
