import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import WordSprintGame from '../components/WordSprintGame';
import { getSprintSentence, SPRINT_SENTENCES } from '../data/sprintSentences';
import api from '../api';

const T = {
  RU: { title: 'СПРИНТ СЛОВ', back: 'Назад' },
  KZ: { title: 'СӨЗ СПРИНТІ', back: 'Артқа' },
  EN: { title: 'WORD SPRINT', back: 'Back' },
};

const ACE_WPM = 40;
const ACE_ACCURACY = 95;

export default function WordSprintPage({ lang, setLang, user, setUser, grantAchievement, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();
  const pool = SPRINT_SENTENCES[lang] || SPRINT_SENTENCES.RU;

  const [index, setIndex] = useState(() => Math.floor(Math.random() * pool.length));
  const [round, setRound] = useState(0); // меняем key у игры, чтобы форсировать чистый рестарт
  const sentence = getSprintSentence(lang, index);

  const nextRound = useCallback(() => {
    setIndex((i) => (i + 1) % pool.length);
    setRound((r) => r + 1);
  }, [pool.length]);

  const handleFinish = async (score, meta) => {
    if (meta.wpm >= ACE_WPM && meta.accuracy >= ACE_ACCURACY) grantAchievement?.('word_sprint_ace');
    api.gameScores.save('word_sprint', score, meta).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} grantAchievement={grantAchievement} {...accessProps} />

      <main id="main-content" className="max-w-2xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        <WordSprintGame key={round} sentence={sentence} lang={lang} onFinish={handleFinish} onExit={() => navigate(-1)} onReplay={nextRound} />
      </main>
    </div>
  );
}
