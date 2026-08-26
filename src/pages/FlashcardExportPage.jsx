import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCw, Download } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';
import { downloadDocx } from '../lib/docxExport';

const T = {
  RU: {
    title: 'КАРТОЧКИ ДЛЯ ПОВТОРЕНИЯ',
    pickTest: 'Выбери Тест', noTests: 'У тебя пока нет ни одного Теста.',
    noQuestions: 'Не удалось разобрать вопросы этого Теста.',
    tapToFlip: 'Нажми, чтобы перевернуть', download: 'Скачать как конспект (.docx)',
    of: 'из',
  },
  KZ: {
    title: 'ҚАЙТАЛАУ КАРТОЧКАЛАРЫ',
    pickTest: 'Тестті таңда', noTests: 'Сенде әзірге бір де Тест жоқ.',
    noQuestions: 'Бұл Тесттің сұрақтарын талдау мүмкін болмады.',
    tapToFlip: 'Аудару үшін басыңыз', download: 'Конспект ретінде жүктеу (.docx)',
    of: '/',
  },
  EN: {
    title: 'FLASHCARDS',
    pickTest: 'Pick a Test', noTests: "You don't have any Tests yet.",
    noQuestions: "Couldn't parse this Test's questions.",
    tapToFlip: 'Tap to flip', download: 'Download as study guide (.docx)',
    of: 'of',
  },
};

// Тот же формат, что парсит backend/src/QuizParser.php ("## N. Вопрос" +
// "- [x] верный / - [ ] вариант"), только на клиенте — карточкам не нужен
// секретный ответ, скрывать нечего (в отличие от живого Теста, см. ADR-0002).
function parseQuestions(md) {
  const lines = (md || '').split('\n');
  const questions = [];
  let current = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const optMatch = line.match(/^[-*]\s*\[([ xX])\]\s*(.+)$/);
    if (optMatch) {
      if (current) {
        const text = optMatch[2].replace(/\*\*/g, '').trim();
        current.options.push(text);
        if (optMatch[1].toLowerCase() === 'x') current.correctIndex = current.options.length - 1;
      }
      continue;
    }

    const qMatch = line.match(/^#{1,3}\s*\d*\.?\s*(.*)$/) || line.match(/^(?:\*\*)?\d+\.\s*(.*)$/);
    if (qMatch && !line.match(/^[-*]/)) {
      if (current && current.options.length >= 2 && current.correctIndex >= 0) questions.push(current);
      const qText = (qMatch[1] || line).replace(/\*\*/g, '').trim();
      if (qText) current = { question: qText, options: [], correctIndex: -1 };
    }
  }
  if (current && current.options.length >= 2 && current.correctIndex >= 0) questions.push(current);
  return questions;
}

export default function FlashcardExportPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    api.tests.list().then((r) => setTests(r.items || [])).catch(() => {});
  }, []);

  const pickTest = async (qz) => {
    setTest(qz); setQuestions(null); setIndex(0); setFlipped(false);
    try {
      const r = await api.tests.get(qz.id);
      setQuestions(parseQuestions(r.item?.result_md));
    } catch {
      setQuestions([]);
    }
  };

  const go = (delta) => {
    setFlipped(false);
    setIndex((i) => Math.max(0, Math.min((questions?.length || 1) - 1, i + delta)));
  };

  const handleDownload = async () => {
    setExportError('');
    const content = questions.map((q, i) => `${i + 1}. ${q.question}\nAnswer: ${q.options[q.correctIndex]}\n`).join('\n');
    try {
      await downloadDocx(`${t.title} — ${test.topic || test.subject}`, content);
    } catch (e) {
      setExportError(e.message || 'Export failed');
    }
  };

  const current = questions?.[index];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-2xl mx-auto px-5 sm:px-6">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000] mb-8">
          <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.pickTest}</label>
          {tests.length === 0 && <p className="text-slate-400 font-bold text-sm">{t.noTests}</p>}
          <div className="flex flex-wrap gap-2">
            {tests.map((qz) => (
              <button key={qz.id} onClick={() => pickTest(qz)}
                className={`px-4 py-2 rounded-xl border-[3px] font-bold text-sm transition-colors ${test?.id === qz.id ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                {qz.topic || qz.subject || `#${qz.id}`}
              </button>
            ))}
          </div>
        </div>

        {questions && questions.length === 0 && (
          <p className="text-red-500 font-bold text-sm">{t.noQuestions}</p>
        )}

        {current && (
          <>
            <button
              onClick={() => setFlipped((f) => !f)}
              className={`w-full min-h-[280px] p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[8px_8px_0_0_#000] flex flex-col items-center justify-center text-center transition-colors ${flipped ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-white dark:bg-zinc-900'}`}
            >
              <p className="text-xl sm:text-2xl font-black leading-snug">
                {flipped ? current.options[current.correctIndex] : current.question}
              </p>
              <p className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                <RotateCw size={14} /> {t.tapToFlip}
              </p>
            </button>

            <div className="flex items-center justify-between mt-6">
              <button onClick={() => go(-1)} disabled={index === 0}
                className="p-3 rounded-xl border-[3px] border-black dark:border-white disabled:opacity-30">
                <ChevronLeft size={20} />
              </button>
              <span className="font-black text-sm">{index + 1} {t.of} {questions.length}</span>
              <button onClick={() => go(1)} disabled={index === questions.length - 1}
                className="p-3 rounded-xl border-[3px] border-black dark:border-white disabled:opacity-30">
                <ChevronRight size={20} />
              </button>
            </div>

            {exportError && <p className="text-red-500 font-bold text-sm mt-4">{exportError}</p>}
            <button onClick={handleDownload}
              className="w-full mt-6 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl border-4 border-black dark:border-white font-black uppercase text-sm flex items-center justify-center gap-2">
              <Download size={16} /> {t.download}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
