import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';
import { quotaMessage } from '../lib/quotaMessage';

const T = {
  RU: {
    title: 'СООБЩЕНИЕ РОДИТЕЛЮ',
    pickClass: 'Выбери класс', noClasses: 'У тебя пока нет ни одного класса.',
    pickStudent: 'Выбери ученика', noStudents: 'В этом классе пока нет учеников.',
    noHistory: 'У этого ученика пока нет ни одного результата теста.',
    tone: 'Тон сообщения',
    toneFriendly: 'Дружелюбный', toneFormal: 'Официальный',
    generate: 'Составить сообщение', generating: 'Составляем...',
    copy: 'Копировать', copied: 'Скопировано!', result: 'РЕЗУЛЬТАТ', back: 'Назад',
  },
  KZ: {
    title: 'АТА-АНАҒА ХАБАРЛАМА',
    pickClass: 'Сыныпты таңда', noClasses: 'Сенде әзірге бір де сынып жоқ.',
    pickStudent: 'Оқушыны таңда', noStudents: 'Бұл сыныпта әзірге оқушы жоқ.',
    noHistory: 'Бұл оқушының әлі бір де тест нәтижесі жоқ.',
    tone: 'Хабарлама тоны',
    toneFriendly: 'Достық', toneFormal: 'Ресми',
    generate: 'Хабарлама жасау', generating: 'Жасалуда...',
    copy: 'Көшіру', copied: 'Көшірілді!', result: 'НӘТИЖЕ', back: 'Артқа',
  },
  EN: {
    title: 'PARENT MESSAGE',
    pickClass: 'Pick a class', noClasses: "You don't have any classes yet.",
    pickStudent: 'Pick a student', noStudents: 'This class has no students yet.',
    noHistory: "This student doesn't have any test results yet.",
    tone: 'Message tone',
    toneFriendly: 'Friendly', toneFormal: 'Formal',
    generate: 'Draft message', generating: 'Generating...',
    copy: 'Copy', copied: 'Copied!', result: 'RESULT', back: 'Back',
  },
};

const LANG_NAMES = { RU: 'Russian', KZ: 'Kazakh', EN: 'English' };

// "Тема" — снова одна на весь Тест (см. Reteach Planner), поэтому "западающие
// темы" ученика — это Тесты, где он набрал меньше 60%, а не абстрактные
// подтемы внутри вопросов.
function buildPrompt(lang, tone, studentName, history) {
  const langName = LANG_NAMES[lang] || 'Russian';
  const sorted = [...history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const weak = sorted.filter((h) => Number(h.percentage) < 60);

  let prompt = `You are a helpful teacher assistant. Draft a short message to a parent about their child's ("${studentName}") recent test performance, in ${langName}, ${tone === 'formal' ? 'formal and professional' : 'warm and friendly'} tone.\n\nRecent test results:\n`;
  sorted.slice(0, 6).forEach((h) => {
    prompt += `- ${h.topic} (${h.subject}): ${h.percentage}%\n`;
  });
  if (weak.length > 0) {
    prompt += `\nTopics the student is struggling with (below 60%): ${weak.map((w) => w.topic).join(', ')}\n`;
  }
  prompt += `
Write 3-4 sentences: 1) a brief overall summary, 2) ${weak.length > 0 ? 'what to review at home based on the struggling topics' : 'positive reinforcement since performance is solid'}, 3) an invitation to reach out with questions. Ready to paste directly into a messaging app — no greeting placeholders like "[Parent name]", no explanations, just the message text.`;
  return prompt;
}

export default function ParentMessagePage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [cls, setCls] = useState(null);
  const [members, setMembers] = useState([]);
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState(null);
  const [tone, setTone] = useState('friendly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.classes.list().then((r) => setClasses(r.items || r.classes || [])).catch(() => {});
  }, []);

  const pickClass = async (c) => {
    setCls(c); setStudent(null); setHistory(null); setOutput(''); setError('');
    try {
      const r = await api.classes.getMembers(c.id, 'approved');
      setMembers(r.members || r.items || []);
    } catch {
      setMembers([]);
    }
  };

  const pickStudent = async (m) => {
    const studentId = m.student_id || m.id;
    const name = m.display_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || m.email;
    setStudent({ id: studentId, name });
    setHistory(null); setOutput(''); setError(''); setLoading(true);
    try {
      const r = await api.student.history(cls.id, studentId);
      const items = r.history || r.items || [];
      setHistory(items);
      if (items.length === 0) setError(t.noHistory);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!student || !history || history.length === 0) return;
    setGenerating(true);
    setOutput('');
    try {
      let text = '';
      for await (const delta of api.generateStream({ prompt: buildPrompt(lang, tone, student.name, history) })) {
        text += (typeof delta === 'string' ? delta : delta?.text || '');
        setOutput(text);
      }
    } catch (e) {
      setOutput(quotaMessage(lang, e) || ('Error: ' + (e.message || 'Generation failed')));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard permission denied — nothing sensible to fall back to here */ }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: pick class/student/tone */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
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

            {cls && (
              <>
                <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.pickStudent}</label>
                {members.length === 0 && <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-3">{t.noStudents}</p>}
                <div className="flex flex-col gap-2 mb-5">
                  {members.map((m) => {
                    const name = m.display_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || m.email;
                    return (
                      <button key={m.student_id || m.id} onClick={() => pickStudent(m)}
                        className={`text-left px-4 py-3 rounded-xl border-[3px] font-bold transition-colors ${student?.id === (m.student_id || m.id) ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                        {name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {loading && <p className="font-bold text-sm text-slate-500 dark:text-slate-400 animate-pulse">...</p>}
            {error && <p role="alert" className="text-red-500 font-bold text-sm mb-3">{error}</p>}

            {history && history.length > 0 && (
              <>
                <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.tone}</label>
                <div className="flex gap-2 mb-5">
                  <button onClick={() => setTone('friendly')}
                    className={`flex-1 py-2 rounded-xl border-[3px] font-bold text-sm ${tone === 'friendly' ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20'}`}>
                    {t.toneFriendly}
                  </button>
                  <button onClick={() => setTone('formal')}
                    className={`flex-1 py-2 rounded-xl border-[3px] font-bold text-sm ${tone === 'formal' ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20'}`}>
                    {t.toneFormal}
                  </button>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-5 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl border-4 border-black dark:border-white shadow-[4px_4px_0_0_#000] disabled:opacity-40 flex items-center justify-center gap-2 hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <Sparkles size={18} />
                  {generating ? t.generating : t.generate}
                </button>
              </>
            )}
          </div>

          {/* Right: output */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">{t.result}</span>
              {output && (
                <button onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black dark:border-white font-black text-sm uppercase hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  {copied ? <><Check size={15} /> {t.copied}</> : <><Copy size={15} /> {t.copy}</>}
                </button>
              )}
            </div>
            <textarea
              readOnly
              aria-live="polite"
              value={output || (generating ? '' : '...')}
              aria-label={t.result}
              className="flex-1 min-h-[300px] bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 font-bold text-sm leading-relaxed resize-none outline-none text-slate-700 dark:text-zinc-300 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
