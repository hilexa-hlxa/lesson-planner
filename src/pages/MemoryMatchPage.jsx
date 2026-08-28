import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SubjectPicker from '../components/SubjectPicker';
import MemoryMatchGame from '../components/MemoryMatchGame';
import { getDeckSortRound } from '../data/subjectDecks';
import api from '../api';

const T = {
  RU: { title: 'ПАМЯТЬ', pick: 'Выбери предмет', back: 'Назад' },
  KZ: { title: 'ЖАД', pick: 'Пәнді таңда', back: 'Артқа' },
  EN: { title: 'MEMORY MATCH', pick: 'Pick a subject', back: 'Back' },
};

export default function MemoryMatchPage({ lang, setLang, user, setUser, grantAchievement, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [labels, setLabels] = useState(null);

  // Пул для матчинга — темы предмета и его термины как ПЛОСКИЙ список текста,
  // без связи "термин относится к теме": Memory Match проверяет только память,
  // не то, знает ли ученик, куда что относится (см. Sort It Out — вот та игра
  // как раз про это).
  const start = (s) => {
    const round = getDeckSortRound(s, lang);
    setSubject(s);
    setLabels([...round.categories, ...round.items.map((it) => it.term)]);
  };
  const reset = () => { setSubject(null); setLabels(null); };

  const handleFinish = async (score, meta) => {
    if (meta.perfect) grantAchievement?.('memory_master');
    api.gameScores.save('memory_match', score, { subject, ...meta }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} grantAchievement={grantAchievement} {...accessProps} />

      <main id="main-content" className="max-w-2xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={labels || subject ? reset : () => navigate(-1)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        {labels ? (
          <MemoryMatchGame labels={labels} lang={lang} onFinish={handleFinish} onExit={reset} onReplay={() => start(subject)} />
        ) : (
          <>
            <h2 className="font-black text-lg uppercase mb-4 text-slate-500">{t.pick}</h2>
            <SubjectPicker lang={lang} onPick={start} />
          </>
        )}
      </main>
    </div>
  );
}
