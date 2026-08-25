import { useState, useEffect, useRef, useMemo } from 'react';
import { CheckCircle, RotateCcw, Timer as TimerIcon, XCircle } from 'lucide-react';

const T = {
  RU: { moves: 'Ходы', mistakes: 'Ошибки', done: 'Собрано!', perfect: 'Без единой ошибки!', again: 'Ещё раз', exit: 'Выход' },
  KZ: { moves: 'Қадам', mistakes: 'Қателер', done: 'Жиналды!', perfect: 'Бір де қатесіз!', again: 'Тағы да', exit: 'Шығу' },
  EN: { moves: 'Moves', mistakes: 'Mistakes', done: 'Cleared!', perfect: 'Zero mistakes!', again: 'Play again', exit: 'Exit' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// pairs: [{id, term, definition}] — каждая пара даёт две карточки: term-face и definition-face
export default function MemoryMatchGame({ pairs, lang = 'RU', onFinish, onExit, onReplay }) {
  const t = T[lang] || T.RU;

  const cards = useMemo(() => shuffle(
    pairs.flatMap((p) => [
      { key: `${p.id}-term`, pairId: p.id, label: p.term },
      { key: `${p.id}-def`, pairId: p.id, label: p.definition },
    ])
  ), [pairs]);

  const [flipped, setFlipped] = useState([]); // indices currently face-up, max 2
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState('playing');
  const startedRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    if (status !== 'playing' || !startedRef.current) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const flip = (idx) => {
    if (lockRef.current || status !== 'playing') return;
    if (flipped.includes(idx) || matched.has(cards[idx].pairId)) return;
    if (!startedRef.current) startedRef.current = true;

    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      lockRef.current = true;
      setMoves((m) => m + 1);
      const [a, b] = next;
      const isMatch = cards[a].pairId === cards[b].pairId;

      setTimeout(() => {
        // Раньше финальный onFinish жил прямо в апдейтере setMatched — в
        // dev+StrictMode React вызывает такие апдейтеры дважды, и очко в
        // game_scores улетало бы на сервер два раза подряд. Апдейтер теперь
        // только считает пары; факт финиша ловит отдельный эффект ниже.
        if (isMatch) setMatched((prev) => new Set(prev).add(cards[a].pairId));
        else setMistakes((m) => m + 1);
        setFlipped([]);
        lockRef.current = false;
      }, isMatch ? 300 : 700);
    }
  };

  const finishedRef = useRef(false);
  useEffect(() => {
    if (status !== 'playing' || matched.size !== pairs.length || pairs.length === 0) return;
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStatus('done');
    const score = Math.max(0, 1000 - seconds * 5 - mistakes * 30);
    onFinish?.(score, { seconds, moves, mistakes, perfect: mistakes === 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched, pairs.length, status]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4 pb-8">
      <div className="w-full flex justify-between font-black text-sm">
        <span>{t.moves}: {moves}</span>
        <span className="flex items-center gap-1"><TimerIcon size={16} /> {seconds}s</span>
        <span>{t.mistakes}: {mistakes}</span>
      </div>

      {status === 'playing' ? (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
          {cards.map((card, idx) => {
            const isUp = flipped.includes(idx) || matched.has(card.pairId);
            return (
              <button
                key={card.key}
                onClick={() => flip(idx)}
                className={`aspect-square rounded-2xl border-[3px] border-black dark:border-white font-black text-[11px] sm:text-sm p-2 flex items-center justify-center text-center transition-all
                  ${matched.has(card.pairId) ? 'bg-green-100 dark:bg-green-900/40 opacity-60' :
                    isUp ? 'bg-fuchsia-100 dark:bg-fuchsia-900/40 shadow-[4px_4px_0_0_#000]' :
                    'bg-fuchsia-500 text-white shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5'}
                `}
              >
                {isUp ? card.label : '?'}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="w-full p-6 rounded-2xl border-4 border-black dark:border-white bg-white dark:bg-zinc-900 text-center">
          <div className="flex justify-center mb-2">
            {mistakes === 0 ? <CheckCircle size={36} className="text-green-500" /> : <XCircle size={36} className="text-fuchsia-500" />}
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
