import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';

const T = {
  RU: {
    title: 'ЖУРНАЛ ПОВЕДЕНИЯ',
    pickClass: 'Выбери класс', noClasses: 'У тебя пока нет ни одного класса.',
    noStudents: 'В этом классе пока нет учеников.',
    notePh: 'Короткая заметка (необязательно)',
    recent: 'ПОСЛЕДНИЕ ЗАПИСИ', noNotes: 'Записей пока нет.',
    justNow: 'только что',
    positive: 'Отметить плюс', negative: 'Отметить минус',
  },
  KZ: {
    title: 'МІНЕЗ-ҚҰЛЫҚ ЖУРНАЛЫ',
    pickClass: 'Сыныпты таңда', noClasses: 'Сенде әзірге бір де сынып жоқ.',
    noStudents: 'Бұл сыныпта әзірге оқушы жоқ.',
    notePh: 'Қысқа жазба (міндетті емес)',
    recent: 'СОҢҒЫ ЖАЗБАЛАР', noNotes: 'Әзірге жазба жоқ.',
    justNow: 'жаңа ғана',
    positive: 'Плюс белгілеу', negative: 'Минус белгілеу',
  },
  EN: {
    title: 'BEHAVIOR LOG',
    pickClass: 'Pick a class', noClasses: "You don't have any classes yet.",
    noStudents: 'This class has no students yet.',
    notePh: 'Short note (optional)',
    recent: 'RECENT ENTRIES', noNotes: 'No entries yet.',
    justNow: 'just now',
    positive: 'Mark positive', negative: 'Mark negative',
  },
};

function nameOf(m) {
  return m.display_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || m.email;
}

export default function BehaviorLogPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [cls, setCls] = useState(null);
  const [members, setMembers] = useState([]);
  const [drafts, setDrafts] = useState({}); // studentId -> note text
  const [notes, setNotes] = useState([]);
  const [saving, setSaving] = useState(null); // studentId currently saving

  useEffect(() => {
    api.classes.list().then((r) => setClasses(r.items || r.classes || [])).catch(() => {});
  }, []);

  const loadNotes = (classId) => {
    api.behaviorNotes.list(classId).then((r) => setNotes(r.notes || [])).catch(() => setNotes([]));
  };

  const pickClass = async (c) => {
    setCls(c); setDrafts({});
    try {
      const r = await api.classes.getMembers(c.id, 'approved');
      setMembers(r.members || r.items || []);
    } catch {
      setMembers([]);
    }
    loadNotes(c.id);
  };

  const log = async (studentId, type) => {
    setSaving(studentId);
    try {
      await api.behaviorNotes.create(cls.id, studentId, type, drafts[studentId] || '');
      setDrafts((d) => ({ ...d, [studentId]: '' }));
      loadNotes(cls.id);
    } catch { /* конкретная ошибка не так важна — просто не запишется в лог */
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main id="main-content" className="max-w-3xl mx-auto px-5 sm:px-6">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000] mb-8">
          <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.pickClass}</label>
          {classes.length === 0 && <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-3">{t.noClasses}</p>}
          <div className="flex flex-wrap gap-2 mb-5">
            {classes.map((c) => (
              <button key={c.id} onClick={() => pickClass(c)}
                className={`px-4 py-2 rounded-xl border-[3px] font-bold text-sm transition-colors ${cls?.id === c.id ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                {c.name}
              </button>
            ))}
          </div>

          {cls && members.length === 0 && <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t.noStudents}</p>}

          {cls && members.length > 0 && (
            <div className="flex flex-col gap-2">
              {members.map((m) => {
                const sid = m.student_id || m.id;
                return (
                  <div key={sid} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800">
                    <span className="font-bold flex-1 min-w-0 truncate">{nameOf(m)}</span>
                    <input
                      value={drafts[sid] || ''}
                      onChange={(e) => setDrafts((d) => ({ ...d, [sid]: e.target.value }))}
                      placeholder={t.notePh}
                      aria-label={`${t.notePh} — ${nameOf(m)}`}
                      className="flex-1 min-w-0 px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg text-sm font-bold outline-none border-2 border-transparent focus:border-black/20 dark:focus:border-white/20"
                    />
                    <button onClick={() => log(sid, 'positive')} disabled={saving === sid}
                      aria-label={`${t.positive} — ${nameOf(m)}`}
                      className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-40 transition-colors shrink-0">
                      <ThumbsUp size={16} />
                    </button>
                    <button onClick={() => log(sid, 'negative')} disabled={saving === sid}
                      aria-label={`${t.negative} — ${nameOf(m)}`}
                      className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-40 transition-colors shrink-0">
                      <ThumbsDown size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cls && (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            <p className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">{t.recent}</p>
            {notes.length === 0 && <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t.noNotes}</p>}
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              {notes.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 ${n.type === 'positive' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'}`}>
                  {n.type === 'positive' ? <ThumbsUp size={16} className="text-green-600 shrink-0 mt-0.5" /> : <ThumbsDown size={16} className="text-red-600 shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <p className="font-bold text-sm">{n.display_name || n.email}</p>
                    {n.note && <p className="text-sm text-slate-500 dark:text-zinc-400">{n.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
