import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';

const T = {
  RU: {
    title: 'ПЕРЕПОВТОРЕНИЕ',
    pickTest: 'Выбери Тест', noTests: 'У тебя пока нет ни одного Теста.',
    noResults: 'По этому Тесту ещё никто не отвечал — нечего анализировать.',
    missedTitle: 'Чаще всего ошибались в этих вопросах',
    missRate: 'ошибок',
    generate: 'Составить план повторения', generating: 'Составляем...',
    copy: 'Копировать', copied: 'Скопировано!', result: 'РЕЗУЛЬТАТ', back: 'Назад',
  },
  KZ: {
    title: 'ҚАЙТА ӨТУ',
    pickTest: 'Тестті таңда', noTests: 'Сенде әзірге бір де Тест жоқ.',
    noResults: 'Бұл Тестке әлі ешкім жауап берген жоқ — талдайтын ештеңе жоқ.',
    missedTitle: 'Ең көп қателескен сұрақтар',
    missRate: 'қате',
    generate: 'Қайталау жоспарын жасау', generating: 'Жасалуда...',
    copy: 'Көшіру', copied: 'Көшірілді!', result: 'НӘТИЖЕ', back: 'Артқа',
  },
  EN: {
    title: 'RETEACH PLANNER',
    pickTest: 'Pick a Test', noTests: "You don't have any Tests yet.",
    noResults: 'No one has answered this Test yet — nothing to analyze.',
    missedTitle: 'Most commonly missed questions',
    missRate: 'missed',
    generate: 'Build a reteach plan', generating: 'Generating...',
    copy: 'Copy', copied: 'Copied!', result: 'RESULT', back: 'Back',
  },
};

const LANG_NAMES = { RU: 'Russian', KZ: 'Kazakh', EN: 'English' };

// Каждая сохранённая попытка несёт answers_json = [{questionText, isCorrect,
// selectedText, correctText}, ...] (см. /api/quiz/submit). "Тема" вопроса
// нигде не хранится отдельно — у Теста она одна на все вопросы (CONTEXT.md),
// поэтому вместо расплывчатого "западающая тема" берём то, что реально есть:
// конкретные вопросы, где чаще всего ошибались, дословно.
function aggregateMissedQuestions(results) {
  const byQuestion = new Map();
  results.forEach((r) => {
    let answers;
    try { answers = JSON.parse(r.answers_json); } catch { answers = []; }
    if (!Array.isArray(answers)) return;
    answers.forEach((a) => {
      if (!a.questionText) return;
      const entry = byQuestion.get(a.questionText) || { misses: 0, total: 0, correctText: a.correctText };
      entry.total += 1;
      if (!a.isCorrect) entry.misses += 1;
      byQuestion.set(a.questionText, entry);
    });
  });
  return [...byQuestion.entries()]
    .map(([question, stats]) => ({ question, ...stats, missRate: stats.total ? stats.misses / stats.total : 0 }))
    .filter((q) => q.misses > 0)
    .sort((a, b) => b.missRate - a.missRate);
}

function buildPrompt(lang, test, missed) {
  const langName = LANG_NAMES[lang] || 'Russian';
  let prompt = `You are a helpful teacher assistant. A class took a test on "${test.topic}" (subject: ${test.subject}). Here are the questions students missed most often, with the miss rate and the correct answer:\n\n`;
  missed.slice(0, 8).forEach((q, i) => {
    prompt += `${i + 1}. "${q.question}" — missed by ${Math.round(q.missRate * 100)}% of attempts. Correct answer: ${q.correctText}\n`;
  });
  prompt += `
Write a short 15-20 minute reteach mini-lesson in ${langName} targeting exactly these gaps. Format:
1. Lesson goal (1 sentence)
2. Key concepts to review (bullet list, tied to the missed questions above)
3. Warm-up activity (5 min)
4. Main reteach activity (10 min)
5. Quick recheck (5 min) — one or two new questions testing the same concepts

Keep it concise and classroom-ready. Write ONLY the plan, no explanations.`;
  return prompt;
}

export default function ReteachPlannerPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [test, setTest] = useState(null);
  const [missed, setMissed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.tests.list().then((r) => setTests(r.items || [])).catch(() => {});
  }, []);

  const pickTest = async (qz) => {
    setTest(qz); setMissed(null); setOutput(''); setError(''); setLoading(true);
    try {
      const r = await api.quiz.report(qz.id);
      const agg = aggregateMissedQuestions(r.results || []);
      setMissed(agg);
      if (agg.length === 0) setError(t.noResults);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!test || !missed || missed.length === 0) return;
    setGenerating(true);
    setOutput('');
    try {
      let text = '';
      for await (const delta of api.generateStream({ prompt: buildPrompt(lang, test, missed) })) {
        text += (typeof delta === 'string' ? delta : delta?.text || '');
        setOutput(text);
      }
    } catch (e) {
      setOutput('Error: ' + (e.message || 'Generation failed'));
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

      <main className="max-w-3xl mx-auto px-5 sm:px-6">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: pick test + missed questions */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.pickTest}</label>
            {tests.length === 0 && <p className="text-slate-400 font-bold text-sm mb-3">{t.noTests}</p>}
            <div className="flex flex-col gap-2 mb-5">
              {tests.map((qz) => (
                <button key={qz.id} onClick={() => pickTest(qz)}
                  className={`text-left px-4 py-3 rounded-xl border-[3px] font-bold transition-colors ${test?.id === qz.id ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                  {qz.topic || qz.subject || `#${qz.id}`}
                </button>
              ))}
            </div>

            {loading && <p className="font-bold text-sm text-slate-400 animate-pulse">...</p>}
            {error && (
              <p className="flex items-center gap-2 text-red-500 font-bold text-sm mb-3"><AlertCircle size={16} /> {error}</p>
            )}

            {missed && missed.length > 0 && (
              <>
                <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.missedTitle}</label>
                <div className="flex flex-col gap-2 mb-5 max-h-[240px] overflow-y-auto">
                  {missed.slice(0, 8).map((q, i) => (
                    <div key={i} className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                      <p className="font-bold text-sm">{q.question}</p>
                      <p className="text-xs font-black uppercase text-red-500">{Math.round(q.missRate * 100)}% {t.missRate}</p>
                    </div>
                  ))}
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
              <span className="font-black text-xs uppercase tracking-widest text-slate-400">{t.result}</span>
              {output && (
                <button onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black dark:border-white font-black text-sm uppercase hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  {copied ? <><Check size={15} /> {t.copied}</> : <><Copy size={15} /> {t.copy}</>}
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={output || (generating ? '' : '...')}
              aria-label={t.result}
              className="flex-1 min-h-[300px] bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 font-bold text-sm leading-relaxed resize-none outline-none text-slate-700 dark:text-zinc-300"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
