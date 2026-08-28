import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Sparkles, Download } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';
import { downloadDocx } from '../lib/docxExport';

const T = {
  RU: {
    title: 'РАБОЧИЙ ЛИСТ',
    subject: 'Предмет', topic: 'Тема', grade: 'Класс', count: 'Количество заданий',
    generate: 'Сгенерировать', generating: 'Генерируем...',
    copy: 'Копировать', copied: 'Скопировано!', download: 'Скачать .docx',
    result: 'РЕЗУЛЬТАТ', back: 'Назад',
  },
  KZ: {
    title: 'ЖҰМЫС ПАРАҒЫ',
    subject: 'Пән', topic: 'Тақырып', grade: 'Сынып', count: 'Тапсырма саны',
    generate: 'Жасау', generating: 'Жасалуда...',
    copy: 'Көшіру', copied: 'Көшірілді!', download: '.docx жүктеу',
    result: 'НӘТИЖЕ', back: 'Артқа',
  },
  EN: {
    title: 'WORKSHEET',
    subject: 'Subject', topic: 'Topic', grade: 'Grade', count: 'Number of questions',
    generate: 'Generate', generating: 'Generating...',
    copy: 'Copy', copied: 'Copied!', download: 'Download .docx',
    result: 'RESULT', back: 'Back',
  },
};

const LANG_NAMES = { RU: 'Russian', KZ: 'Kazakh', EN: 'English' };

function buildPrompt(lang, form) {
  const langName = LANG_NAMES[lang] || 'Russian';
  return `You are a helpful teacher assistant. Write a printable practice worksheet in ${langName} for grade ${form.grade} on the topic "${form.topic}" (subject: ${form.subject}), with ${form.count} questions.

Format:
## Worksheet: ${form.topic}
[numbered questions, a mix of question types appropriate for the subject — no answers here]

## Answer Key
[numbered answers matching the questions above]

Keep it classroom-ready. Write ONLY the worksheet, no explanations.`;
}

export default function WorksheetGeneratorPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [form, setForm] = useState({ subject: '', topic: '', grade: 5, count: 10 });
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState('');

  const handleGenerate = async () => {
    if (!form.subject.trim() || !form.topic.trim()) return;
    setGenerating(true);
    setOutput('');
    try {
      let text = '';
      for await (const delta of api.generateStream({ prompt: buildPrompt(lang, form) })) {
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
    } catch { /* clipboard permission denied */ }
  };

  const handleDownload = async () => {
    setExportError('');
    try {
      await downloadDocx(`${t.title} — ${form.topic}`, output);
    } catch (e) {
      setExportError(e.message || 'Export failed');
    }
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
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            <div className="space-y-4">
              <div>
                <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.subject}</label>
                <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  aria-label={t.subject}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none focus:ring-2 ring-emerald-500/30"
                  placeholder="Математика" />
              </div>
              <div>
                <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.topic}</label>
                <input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  aria-label={t.topic}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none focus:ring-2 ring-emerald-500/30"
                  placeholder="Дроби" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.grade}</label>
                  <select value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: Number(e.target.value) }))}
                    aria-label={t.grade}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none">
                    {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.count}</label>
                  <select value={form.count} onChange={(e) => setForm((f) => ({ ...f, count: Number(e.target.value) }))}
                    aria-label={t.count}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none">
                    {[5, 10, 15, 20].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleGenerate} disabled={generating || !form.subject.trim() || !form.topic.trim()}
                className="w-full py-5 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl border-4 border-black dark:border-white shadow-[4px_4px_0_0_#000] disabled:opacity-40 flex items-center justify-center gap-2 hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                <Sparkles size={18} />
                {generating ? t.generating : t.generate}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000] flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="font-black text-xs uppercase tracking-widest text-slate-400">{t.result}</span>
              {output && (
                <div className="flex gap-2">
                  <button onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black dark:border-white font-black text-sm uppercase hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    {copied ? <><Check size={15} /> {t.copied}</> : <><Copy size={15} /> {t.copy}</>}
                  </button>
                  <button onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black dark:border-white font-black text-sm uppercase hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <Download size={15} /> {t.download}
                  </button>
                </div>
              )}
            </div>
            {exportError && <p className="text-red-500 font-bold text-sm mb-2">{exportError}</p>}
            <textarea readOnly value={output || (generating ? '' : '...')}
              aria-label={t.result}
              className="flex-1 min-h-[300px] bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 font-bold text-sm leading-relaxed resize-none outline-none text-slate-700 dark:text-zinc-300" />
          </div>
        </div>
      </main>
    </div>
  );
}
