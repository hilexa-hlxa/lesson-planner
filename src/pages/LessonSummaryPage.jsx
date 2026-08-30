import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';
import { quotaMessage } from '../lib/quotaMessage';

const T = {
  RU: {
    title: 'ИТОГ УРОКА',
    subject: 'Предмет',
    topic: 'Тема урока',
    notes: 'Краткие заметки (что делали, какое ДЗ задали)',
    generate: 'Сгенерировать итог',
    generating: 'Генерируем...',
    copy: 'Копировать',
    copied: 'Скопировано!',
    result: 'РЕЗУЛЬТАТ',
    loadingTest: 'Загружаем результаты теста...',
    testAttached: 'Тест прикреплён — результаты включены автоматически.',
    placeholderNotes: 'Например: прошли тему дробей, объяснили смешанные числа, ДЗ — стр. 45 упр. 3.',
  },
  KZ: {
    title: 'САБАҚ ҚОРЫТЫНДЫСЫ',
    subject: 'Пән',
    topic: 'Сабақ тақырыбы',
    notes: 'Қысқаша жазбалар (не жасадық, үй тапсырмасы)',
    generate: 'Қорытынды жасау',
    generating: 'Жасалуда...',
    copy: 'Көшіру',
    copied: 'Көшірілді!',
    result: 'НӘТИЖЕ',
    loadingTest: 'Тест нәтижелері жүктелуде...',
    testAttached: 'Тест тіркелді — нәтижелер автоматты қосылады.',
    placeholderNotes: 'Мысалы: бөлшектер тақырыбын өттік, аралас сандарды түсіндірдік, үй тапсырмасы — 45 бет 3 жатт.',
  },
  EN: {
    title: 'LESSON SUMMARY',
    subject: 'Subject',
    topic: 'Lesson Topic',
    notes: 'Brief notes (what was covered, homework set)',
    generate: 'Generate Summary',
    generating: 'Generating...',
    copy: 'Copy',
    copied: 'Copied!',
    result: 'RESULT',
    loadingTest: 'Loading test results...',
    testAttached: 'Test attached — results included automatically.',
    placeholderNotes: 'e.g. Covered fractions, explained mixed numbers, HW: page 45 exercise 3.',
  },
};

const LANG_NAMES = { RU: 'Russian', KZ: 'Kazakh', EN: 'English' };

function buildPrompt(lang, form, testResults) {
  const langName = LANG_NAMES[lang] || 'Russian';
  let prompt = `You are a helpful teacher assistant. Write a professional lesson summary in ${langName} language.

Lesson details:
- Subject: ${form.subject}
- Topic: ${form.topic}
- Teacher notes: ${form.notes || 'No additional notes.'}
`;

  if (testResults && testResults.length > 0) {
    prompt += `\nTest results from today's lesson:\n`;
    testResults.forEach(r => {
      prompt += `- ${r.student_name}: ${r.score}/${r.total_questions} (${r.percentage}%)\n`;
    });
    const struggling = testResults.filter(r => Number(r.percentage) < 60);
    if (struggling.length > 0) {
      prompt += `\nStudents below 60%: ${struggling.map(s => s.student_name).join(', ')}\n`;
    }
  }

  prompt += `
Write the summary in ${langName} in this format:
1. Topic covered: [what was taught in 1-2 sentences]
2. Homework: [what was assigned, or "Not assigned" if not mentioned]
${testResults && testResults.length > 0 ? '3. Students needing support: [names and brief note on what they struggled with, based on test results]\n' : ''}
Keep it concise, professional, and ready to copy-paste into school records. Write ONLY the summary, no explanations.`;

  return prompt;
}

export default function LessonSummaryPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const quizId = searchParams.get('quiz_id');
  const [form, setForm] = useState({
    subject: searchParams.get('subject') || '',
    topic: searchParams.get('topic') || '',
    notes: '',
  });

  const [testResults, setTestResults] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef(null);

  // Auto-fetch test results if quiz_id is in URL
  useEffect(() => {
    if (!quizId) return;
    setLoadingTest(true);
    api.request(`/quiz/${quizId}/report`)
      .then(r => setTestResults(r.results || []))
      .catch(() => setTestResults([]))
      .finally(() => setLoadingTest(false));
  }, [quizId]);

  const handleGenerate = async () => {
    if (!form.subject.trim() || !form.topic.trim()) return;
    setGenerating(true);
    setOutput('');

    const prompt = buildPrompt(lang, form, testResults);

    try {
      let text = '';
      for await (const delta of api.generateStream({ prompt })) {
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
    } catch {
      const el = outputRef.current;
      if (el) { el.select(); document.execCommand('copy'); }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            {quizId && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                {loadingTest ? t.loadingTest : t.testAttached}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.subject}</label>
                <input
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  aria-label={t.subject}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none focus:ring-2 ring-emerald-500/30"
                  placeholder="Математика"
                />
              </div>

              <div>
                <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.topic}</label>
                <input
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  aria-label={t.topic}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none focus:ring-2 ring-emerald-500/30"
                  placeholder="Дроби"
                />
              </div>

              <div>
                <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.notes}</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={5}
                  aria-label={t.notes}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none focus:ring-2 ring-emerald-500/30 resize-none"
                  placeholder={t.placeholderNotes}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !form.subject.trim() || !form.topic.trim()}
                className="w-full py-5 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl border-4 border-black dark:border-white shadow-[4px_4px_0_0_#000] disabled:opacity-40 flex items-center justify-center gap-2 hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <Sparkles size={18} />
                {generating ? t.generating : t.generate}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">{t.result}</span>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black dark:border-white font-black text-sm uppercase hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  {copied ? <><Check size={15}/> {t.copied}</> : <><Copy size={15}/> {t.copy}</>}
                </button>
              )}
            </div>

            <textarea
              ref={outputRef}
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
