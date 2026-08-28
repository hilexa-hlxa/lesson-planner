import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Sparkles, Download, Languages } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';
import { downloadDocx } from '../lib/docxExport';

const T = {
  RU: {
    title: 'ПЕРЕВОД МАТЕРИАЛА',
    pick: 'Выбери материал', noItems: 'У тебя пока нет ни одного плана урока или Теста.',
    targetLang: 'Перевести на',
    generate: 'Перевести', generating: 'Переводим...',
    copy: 'Копировать', copied: 'Скопировано!', download: 'Скачать .docx',
    result: 'РЕЗУЛЬТАТ', back: 'Назад',
    lessonPlan: 'План урока', test: 'Тест',
  },
  KZ: {
    title: 'МАТЕРИАЛДЫ АУДАРУ',
    pick: 'Материалды таңда', noItems: 'Сенде әзірге бір де сабақ жоспары немесе Тест жоқ.',
    targetLang: 'Аудару тілі',
    generate: 'Аудару', generating: 'Аударылуда...',
    copy: 'Көшіру', copied: 'Көшірілді!', download: '.docx жүктеу',
    result: 'НӘТИЖЕ', back: 'Артқа',
    lessonPlan: 'Сабақ жоспары', test: 'Тест',
  },
  EN: {
    title: 'TRANSLATE MATERIAL',
    pick: 'Pick a material', noItems: "You don't have any Lesson Plans or Tests yet.",
    targetLang: 'Translate to',
    generate: 'Translate', generating: 'Translating...',
    copy: 'Copy', copied: 'Copied!', download: 'Download .docx',
    result: 'RESULT', back: 'Back',
    lessonPlan: 'Lesson Plan', test: 'Test',
  },
};

const LANG_NAMES = { RU: 'Russian', KZ: 'Kazakh', EN: 'English' };

function contentOf(item) {
  if (item.result_md && item.result_md.trim()) return item.result_md;
  if (item.result_json) {
    try { return JSON.stringify(JSON.parse(item.result_json), null, 2); } catch { return String(item.result_json); }
  }
  return '';
}

function buildPrompt(targetLangName, sourceContent) {
  return `Translate the following teaching material into ${targetLangName}. Keep the exact same structure, formatting, numbering, and markdown (headings, lists, bold) — translate only the natural-language text content, not any JSON keys or field names if present. Write ONLY the translated material, no explanations, no preamble.

---
${sourceContent}
---`;
}

export default function TranslateMaterialsPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [targetLang, setTargetLang] = useState(lang === 'RU' ? 'KZ' : 'RU');
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    Promise.all([api.lessonPlans.list(50), api.tests.list(50)]).then(([lp, tests]) => {
      const lpItems = (lp.items || []).map((i) => ({ ...i, kind: 'lesson_plan' }));
      const testItems = (tests.items || []).map((i) => ({ ...i, kind: 'test' }));
      setItems([...lpItems, ...testItems].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }).catch(() => {});
  }, []);

  const pickItem = async (i) => {
    setOutput('');
    try {
      const getter = i.kind === 'lesson_plan' ? api.lessonPlans.get : api.tests.get;
      const r = await getter(i.id);
      setItem({ ...i, full: r.item });
    } catch {
      setItem(null);
    }
  };

  const handleGenerate = async () => {
    if (!item?.full) return;
    const content = contentOf(item.full);
    if (!content.trim()) return;
    setGenerating(true);
    setOutput('');
    try {
      let text = '';
      for await (const delta of api.generateStream({ prompt: buildPrompt(LANG_NAMES[targetLang] || 'Russian', content) })) {
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
      await downloadDocx(`${item?.topic || t.title} (${targetLang})`, output);
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
            <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.pick}</label>
            {items.length === 0 && <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-3">{t.noItems}</p>}
            <div className="flex flex-col gap-2 mb-5 max-h-[220px] overflow-y-auto">
              {items.map((i) => (
                <button key={`${i.kind}-${i.id}`} onClick={() => pickItem(i)}
                  className={`text-left px-4 py-3 rounded-xl border-[3px] font-bold transition-colors flex items-center justify-between ${item?.id === i.id && item?.kind === i.kind ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                  <span>{i.topic || i.subject || `#${i.id}`}</span>
                  <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 shrink-0 ml-2">{i.kind === 'lesson_plan' ? t.lessonPlan : t.test}</span>
                </button>
              ))}
            </div>

            {item && (
              <>
                <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.targetLang}</label>
                <div className="flex gap-2 mb-5">
                  {['RU', 'KZ', 'EN'].map((l) => (
                    <button key={l} onClick={() => setTargetLang(l)}
                      className={`flex-1 py-2 rounded-xl border-[3px] font-bold text-sm ${targetLang === l ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20'}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <button onClick={handleGenerate} disabled={generating}
                  className="w-full py-5 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl border-4 border-black dark:border-white shadow-[4px_4px_0_0_#000] disabled:opacity-40 flex items-center justify-center gap-2 hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                  <Languages size={18} />
                  {generating ? t.generating : t.generate}
                </button>
              </>
            )}
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
            {exportError && <p className="text-red-500 font-bold text-sm mb-2">{exportError}</p>}
            <textarea readOnly value={output || (generating ? '' : '...')}
              aria-label={t.result}
              className="flex-1 min-h-[300px] bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 font-bold text-sm leading-relaxed resize-none outline-none text-slate-700 dark:text-zinc-300 focus:ring-2 focus:ring-emerald-500/40" />
          </div>
        </div>
      </main>
    </div>
  );
}
