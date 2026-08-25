import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const T = {
  RU: { pick: 'Выбери термин, затем категорию', mistakes: 'Ошибки', done: 'Готово!', perfect: 'Без единой ошибки!', again: 'Ещё раз', exit: 'Выход' },
  KZ: { pick: 'Терминді, содан кейін санатты таңда', mistakes: 'Қателер', done: 'Дайын!', perfect: 'Бір де қатесіз!', again: 'Тағы да', exit: 'Шығу' },
  EN: { pick: 'Tap a term, then its category', mistakes: 'Mistakes', done: 'Done!', perfect: 'Zero mistakes!', again: 'Play again', exit: 'Exit' },
};

const BUCKET_COLORS = ['bg-lime-100 dark:bg-lime-900/30 border-lime-600', 'bg-sky-100 dark:bg-sky-900/30 border-sky-600', 'bg-amber-100 dark:bg-amber-900/30 border-amber-600', 'bg-fuchsia-100 dark:bg-fuchsia-900/30 border-fuchsia-600'];

// round: { categories: string[], items: [{id, term, categoryIndex}] }
export default function SortItOutGame({ round, lang = 'RU', onFinish, onExit, onReplay }) {
  const t = T[lang] || T.RU;
  const { categories, items } = round;

  const [placed, setPlaced] = useState({}); // itemId -> categoryIndex (only correct placements land here)
  const [selected, setSelected] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [shakeCategory, setShakeCategory] = useState(null);
  const [status, setStatus] = useState('playing');

  const unplaced = items.filter((i) => placed[i.id] === undefined);

  const pickCategory = (catIndex) => {
    if (selected === null || status !== 'playing') return;
    const item = items.find((i) => i.id === selected);
    if (item.categoryIndex === catIndex) {
      const nextPlaced = { ...placed, [item.id]: catIndex };
      setPlaced(nextPlaced);
      setSelected(null);
      if (Object.keys(nextPlaced).length === items.length) {
        setStatus('done');
        const score = Math.max(0, 500 - mistakes * 40);
        onFinish?.(score, { mistakes, perfect: mistakes === 0, total: items.length });
      }
    } else {
      setMistakes((m) => m + 1);
      setShakeCategory(catIndex);
      setTimeout(() => setShakeCategory(null), 350);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4 pb-8">
      <div className="w-full flex justify-between font-black text-sm">
        <span className="text-slate-500">{t.pick}</span>
        <span>{t.mistakes}: {mistakes}</span>
      </div>

      {status === 'playing' ? (
        <>
          {/* Unplaced term chips */}
          <div className="flex flex-wrap gap-2 justify-center min-h-[52px]">
            {unplaced.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id === selected ? null : item.id)}
                className={`px-4 py-2 rounded-xl border-[3px] border-black dark:border-white font-black text-sm transition-all
                  ${selected === item.id ? 'bg-black text-white dark:bg-white dark:text-black scale-105' : 'bg-white dark:bg-zinc-900 hover:-translate-y-0.5'}
                `}
              >
                {item.term}
              </button>
            ))}
          </div>

          {/* Category buckets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            {categories.map((cat, ci) => (
              <button
                key={ci}
                onClick={() => pickCategory(ci)}
                className={`p-4 rounded-2xl border-[3px] min-h-[120px] font-black text-sm transition-all flex flex-col gap-2
                  ${BUCKET_COLORS[ci % BUCKET_COLORS.length]}
                  ${shakeCategory === ci ? 'animate-[shake_0.35s_ease-in-out]' : ''}
                  ${selected !== null ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default opacity-90'}
                `}
              >
                <span className="uppercase tracking-wide">{cat}</span>
                <div className="flex flex-wrap gap-1.5">
                  {items.filter((i) => placed[i.id] === ci).map((i) => (
                    <span key={i.id} className="px-2 py-1 rounded-lg bg-white/70 dark:bg-black/30 text-xs font-bold">{i.term}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="w-full p-6 rounded-2xl border-4 border-black dark:border-white bg-white dark:bg-zinc-900 text-center">
          <div className="flex justify-center mb-2">
            {mistakes === 0 ? <CheckCircle size={36} className="text-green-500" /> : <XCircle size={36} className="text-lime-600" />}
          </div>
          <p className="font-black text-xl mb-1">{t.done}</p>
          {mistakes === 0 && <p className="font-bold text-sm text-slate-500">{t.perfect}</p>}
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={onExit} className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-black text-sm uppercase">
              {t.exit}
            </button>
            {onReplay && (
              <button onClick={onReplay} className="px-5 py-2 border-2 border-black dark:border-white rounded-xl font-black text-sm uppercase flex items-center gap-2">
                <RotateCcw size={14} /> {t.again}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
