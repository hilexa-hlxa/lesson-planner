import { useState, useEffect } from "react";
import { GraduationCap, Clock, CheckCircle, ChevronDown, ChevronUp, Trophy, AlertCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";
import { parseMarkdownQuiz } from "../lib/quizParser";

const T = {
  RU: {
    title: "МОИ КЛАССЫ", join: "Войти в класс", codePlaceholder: "Код класса (6 символов)", joinBtn: "Подать заявку",
    teacher: "Учитель", noClasses: "Вы пока не состоите ни в одном классе.", sent: "Заявка отправлена! Ждите одобрения учителя.",
    alreadyApplied: "Вы уже подали заявку в этот класс.", alreadyMember: "Вы уже состоите в этом классе.",
    notFound: "Класс не найден.", pending: "Ожидает одобрения", history: "История тестов",
    noHistory: "В этом классе тестов ещё не было.", score: "Баллы", date: "Дата", seeMore: "Разбор", hide: "Скрыть",
    wrongQ: "Ошибки:", yourAnswer: "Ваш ответ:", correct: "Правильно:",
  },
  KZ: {
    title: "МЕНІҢ СЫНЫПТАРЫМ", join: "Сыныпқа кіру", codePlaceholder: "Сынып коды (6 таңба)", joinBtn: "Өтінім беру",
    teacher: "Мұғалім", noClasses: "Сіз әлі бірде-бір сыныпта жоқсыз.", sent: "Өтінім жіберілді! Мұғалімнің мақұлдауын күтіңіз.",
    alreadyApplied: "Сіз бұл сыныпқа өтінім бердіңіз.", alreadyMember: "Сіз бұл сыныпта бар.",
    notFound: "Сынып табылмады.", pending: "Мақұлдауды күтуде", history: "Тест тарихы",
    noHistory: "Бұл сыныпта тест болмады.", score: "Ұпай", date: "Күні", seeMore: "Талдау", hide: "Жасыру",
    wrongQ: "Қателер:", yourAnswer: "Сіздің жауабыңыз:", correct: "Дұрысы:",
  },
  EN: {
    title: "MY CLASSES", join: "Join a Class", codePlaceholder: "Class code (6 characters)", joinBtn: "Apply",
    teacher: "Teacher", noClasses: "You are not in any class yet.", sent: "Application sent! Wait for teacher approval.",
    alreadyApplied: "You already applied to this class.", alreadyMember: "You are already a member of this class.",
    notFound: "Class not found.", pending: "Pending approval", history: "Test History",
    noHistory: "No tests in this class yet.", score: "Score", date: "Date", seeMore: "Review", hide: "Hide",
    wrongQ: "Mistakes:", yourAnswer: "Your answer:", correct: "Correct:",
  },
};

function HistoryRow({ item, t }) {
  const [open, setOpen] = useState(false);

  const answers = (() => {
    try { return JSON.parse(item.answers_json || '[]'); } catch { return []; }
  })();

  const wrong = answers.filter(a => !a.isCorrect);
  const pct = Math.round(Number(item.percentage) || 0);
  const pctColor = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="rounded-2xl border-2 border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between px-5 py-4 gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-black truncate">{item.topic}</p>
          <p className="text-xs text-slate-400 font-bold">{item.subject} · {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <div className={`font-black text-xl shrink-0 ${pctColor}`}>{pct}%</div>
        <div className="text-sm text-slate-400 font-bold shrink-0">{item.score}/{item.total_questions}</div>
        {wrong.length > 0 && (
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-black/10 dark:border-white/10 font-black text-xs uppercase text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0"
          >
            {open ? <><ChevronUp size={14}/>{t.hide}</> : <><ChevronDown size={14}/>{t.seeMore}</>}
          </button>
        )}
      </div>

      {open && wrong.length > 0 && (
        <div className="border-t-2 border-black/10 dark:border-white/10 px-5 py-4 space-y-3 bg-slate-50 dark:bg-zinc-950">
          <p className="font-black text-xs uppercase text-slate-400 mb-2">{t.wrongQ}</p>
          {wrong.map((a, i) => (
            <div key={i} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
              <p className="font-bold text-sm mb-1.5 dark:text-white">
                {a.questionText || `Вопрос ${a.questionId + 1}`}
              </p>
              <p className="text-xs text-red-500 font-bold">{t.yourAnswer} {a.selectedText || '—'}</p>
              <p className="text-xs text-green-600 font-bold">{t.correct} {a.correctText || '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClassHistory({ classId, t }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.student.history(classId)
      .then(r => setHistory(r.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <div className="py-6 text-center text-slate-400 font-black animate-pulse">...</div>;
  if (!history.length) return <p className="py-6 text-center text-slate-400 font-bold text-sm">{t.noHistory}</p>;

  return (
    <div className="space-y-3 pt-4">
      {history.map((item, i) => <HistoryRow key={i} item={item} t={t} />)}
    </div>
  );
}

export default function StudentClassesPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);

  useEffect(() => {
    api.classes.list().then(r => setClasses(r.items || [])).finally(() => setLoading(false));
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) return;
    setJoining(true); setJoinMsg(null);
    try {
      const r = await api.classes.join(trimmed);
      if (r.status === 'already_member') { setJoinMsg({ type: 'info', text: t.alreadyMember }); return; }
      if (r.status === 'already_applied') { setJoinMsg({ type: 'info', text: t.alreadyApplied }); return; }
      setJoinMsg({ type: 'success', text: t.sent });
      setCode("");
    } catch (err) {
      if (err.status === 404) setJoinMsg({ type: 'error', text: t.notFound });
      else setJoinMsg({ type: 'error', text: err.message || 'Error' });
    } finally { setJoining(false); }
  };

  const approved = classes.filter(c => c.status === 'approved' || !c.status);
  const pending = classes.filter(c => c.status === 'pending');

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-black text-white dark:bg-white dark:text-black rounded-2xl">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">{t.title}</h1>
        </div>

        {/* Join form */}
        <div className="mb-10 p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
          <h2 className="font-black text-xl uppercase mb-5">{t.join}</h2>
          <form onSubmit={handleJoin} className="flex gap-3">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder={t.codePlaceholder}
              maxLength={6}
              className="flex-1 px-5 py-3 border-4 border-black dark:border-white rounded-2xl bg-[#f8fafc] dark:bg-zinc-800 font-mono font-black text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
            <button
              type="submit"
              disabled={joining || code.trim().length !== 6}
              className="px-6 py-3 bg-blue-600 text-white font-black uppercase rounded-2xl border-4 border-black dark:border-white disabled:opacity-40 transition-opacity"
            >
              {t.joinBtn}
            </button>
          </form>
          {joinMsg && (
            <div className={`mt-4 px-4 py-3 rounded-xl font-bold text-sm ${joinMsg.type === 'success' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : joinMsg.type === 'error' ? 'bg-red-100 dark:bg-red-900/40 text-red-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'}`}>
              {joinMsg.text}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 font-black text-xl animate-pulse">...</div>
        ) : (
          <>
            {pending.length > 0 && (
              <div className="mb-6 space-y-3">
                {pending.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between px-6 py-5 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border-2 border-orange-200 dark:border-orange-700">
                    <div>
                      <div className="font-black text-lg">{cls.name}</div>
                      {cls.teacher_name && <div className="text-slate-400 text-sm font-bold">{t.teacher}: {cls.teacher_name}</div>}
                    </div>
                    <span className="flex items-center gap-1.5 text-orange-500 font-bold text-sm">
                      <Clock size={14} /> {t.pending}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {approved.length === 0 ? (
              <p className="text-slate-400 font-bold text-center py-8">{t.noClasses}</p>
            ) : (
              <div className="space-y-4">
                {approved.map(cls => (
                  <div key={cls.id} className="rounded-[24px] border-2 border-black/10 dark:border-white/10 overflow-hidden">
                    <button
                      onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
                      className="w-full flex items-center justify-between px-6 py-5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="text-left">
                        <div className="font-black text-xl">{cls.name}</div>
                        {cls.teacher_name && <div className="text-slate-400 text-sm font-bold">{t.teacher}: {cls.teacher_name}</div>}
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-500 shrink-0" />
                        {expandedClass === cls.id ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                      </div>
                    </button>

                    {expandedClass === cls.id && (
                      <div className="px-6 pb-6 bg-slate-50 dark:bg-zinc-950 border-t-2 border-black/10 dark:border-white/10">
                        <p className="font-black text-xs uppercase text-slate-400 pt-4 mb-2">{t.history}</p>
                        <ClassHistory classId={cls.id} t={t} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
