import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Sparkles, Download } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';
import { downloadDocx } from '../lib/docxExport';

const T = {
  RU: {
    title: 'КРИТЕРИИ ОЦЕНИВАНИЯ',
    assignment: 'Что оцениваем', assignmentPh: 'Например: устная презентация проекта по биологии',
    levels: 'Уровней оценки', criteria: 'Критериев',
    generate: 'Составить рубрику', generating: 'Составляем...',
    copy: 'Копировать', copied: 'Скопировано!', download: 'Скачать .docx',
    result: 'РЕЗУЛЬТАТ', back: 'Назад',
  },
  KZ: {
    title: 'БАҒАЛАУ КРИТЕРИЙЛЕРІ',
    assignment: 'Нені бағалаймыз', assignmentPh: 'Мысалы: биология жобасы бойынша ауызша баяндама',
    levels: 'Баға деңгейлері', criteria: 'Критерийлер',
    generate: 'Рубрика жасау', generating: 'Жасалуда...',
    copy: 'Көшіру', copied: 'Көшірілді!', download: '.docx жүктеу',
    result: 'НӘТИЖЕ', back: 'Артқа',
  },
  EN: {
    title: 'RUBRIC BUILDER',
    assignment: 'What are you grading', assignmentPh: 'e.g. an oral presentation on a biology project',
    levels: 'Performance levels', criteria: 'Criteria',
    generate: 'Build rubric', generating: 'Generating...',
    copy: 'Copy', copied: 'Copied!', download: 'Download .docx',
    result: 'RESULT', back: 'Back',
  },
};

const LANG_NAMES = { RU: 'Russian', KZ: 'Kazakh', EN: 'English' };

function buildPrompt(lang, form) {
  const langName = LANG_NAMES[lang] || 'Russian';
  return `You are a helpful teacher assistant. Write a grading rubric in ${langName} for: "${form.assignment}".

The rubric should have ${form.criteria} distinct criteria and ${form.levels} performance levels (from lowest to highest). Format it as a markdown table:

| Criterion | [Level 1 name] | [Level 2 name] | ... |
|---|---|---|---|
| [criterion 1] | [description] | [description] | ... |
...

Pick sensible, assignment-appropriate criteria and level names (e.g. "Needs Improvement / Developing / Proficient / Exemplary" or similar). Each cell should briefly describe what that level of performance looks like for that criterion. Write ONLY the table, no explanations.`;
}

export default function RubricBuilderPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [form, setForm] = useState({ assignment: '', levels: 4, criteria: 4 });
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState('');

  const handleGenerate = async () => {
    if (!form.assignment.trim()) return;
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
      await downloadDocx(`${t.title} — ${form.assignment}`, output);
    } catch (e) {
      setExportError(e.message || 'Export failed');
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
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            <div className="space-y-4">
              <div>
                <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.assignment}</label>
                <textarea value={form.assignment} onChange={(e) => setForm((f) => ({ ...f, assignment: e.target.value }))}
                  rows={4}
                  aria-label={t.assignment}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none focus:ring-2 ring-emerald-500/30 resize-none"
                  placeholder={t.assignmentPh} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.criteria}</label>
                  <select value={form.criteria} onChange={(e) => setForm((f) => ({ ...f, criteria: Number(e.target.value) }))}
                    aria-label={t.criteria}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500/40">
                    {[3, 4, 5, 6].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.levels}</label>
                  <select value={form.levels} onChange={(e) => setForm((f) => ({ ...f, levels: Number(e.target.value) }))}
                    aria-label={t.levels}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500/40">
                    {[3, 4, 5].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleGenerate} disabled={generating || !form.assignment.trim()}
                className="w-full py-5 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl border-4 border-black dark:border-white shadow-[4px_4px_0_0_#000] disabled:opacity-40 flex items-center justify-center gap-2 hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                <Sparkles size={18} />
                {generating ? t.generating : t.generate}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000] flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">{t.result}</span>
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
            {exportError && <p role="alert" className="text-red-500 font-bold text-sm mb-2">{exportError}</p>}
            <textarea readOnly aria-live="polite" value={output || (generating ? '' : '...')}
              aria-label={t.result}
              className="flex-1 min-h-[300px] bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 font-bold text-sm leading-relaxed resize-none outline-none text-slate-700 dark:text-zinc-300 focus:ring-2 focus:ring-emerald-500/40" />
          </div>
        </div>
      </main>
    </div>
  );
}
