import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { KEYBOARDS, LETTER_KEY_REGEX } from '../lib/keyboards';

const MAX_WRONG = 6;

// Вместо виселицы — собираем дружелюбного робота по частям. Дособрали робота
// (6 ошибок) — раунд проигран, но экран не мрачный: за столом остаётся просто
// забавный робот, а не повешенный человек. Угадали слово раньше — робот
// подмигивает и радуется вместе с игроком.
const ROBOT_PARTS = [
  // [key, jsx] — добавляются по одной на каждую ошибку
  ['head', <rect key="head" x="70" y="20" width="60" height="50" rx="12" fill="#38bdf8" stroke="black" strokeWidth="4" />],
  ['eye-l', <circle key="eye-l" cx="90" cy="45" r="6" fill="black" />],
  ['eye-r', <circle key="eye-r" cx="110" cy="45" r="6" fill="black" />],
  ['body', <rect key="body" x="60" y="75" width="80" height="70" rx="14" fill="#fbbf24" stroke="black" strokeWidth="4" />],
  ['arm-l', <rect key="arm-l" x="30" y="80" width="28" height="16" rx="8" fill="#fb923c" stroke="black" strokeWidth="4" />],
  ['arm-r', <rect key="arm-r" x="142" y="80" width="28" height="16" rx="8" fill="#fb923c" stroke="black" strokeWidth="4" />],
  ['leg-l', <rect key="leg-l" x="72" y="148" width="18" height="34" rx="6" fill="#64748b" stroke="black" strokeWidth="4" />],
  ['leg-r', <rect key="leg-r" x="110" y="148" width="18" height="34" rx="6" fill="#64748b" stroke="black" strokeWidth="4" />],
];

const T = {
  RU: { won: 'Отгадал!', lost: 'На этот раз не вышло', theWord: 'Слово было:', wrong: 'Ошибок', again: 'Снова', exit: 'Выход' },
  KZ: { won: 'Таптың!', lost: 'Бұл жолы шықпады', theWord: 'Сөз мынау еді:', wrong: 'Қателер', again: 'Қайта', exit: 'Шығу' },
  EN: { won: 'You got it!', lost: 'Not this time', theWord: 'The word was:', wrong: 'Wrong guesses', again: 'Play again', exit: 'Exit' },
};

export default function HangmanGame({ word, lang = 'RU', onComplete, onExit }) {
  const target = word.toUpperCase();
  const letters = useMemo(() => [...new Set(target.split(''))], [target]);

  const [guessed, setGuessed] = useState(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'lost'

  const keyboard = KEYBOARDS[lang] || KEYBOARDS.RU;
  const t = T[lang] || T.RU;

  const guess = useCallback((letter) => {
    if (status !== 'playing' || guessed.has(letter)) return;
    const next = new Set(guessed).add(letter);
    setGuessed(next);

    if (target.includes(letter)) {
      const solved = letters.every((l) => next.has(l));
      if (solved) { setStatus('won'); onComplete?.(true, wrongCount); }
    } else {
      const wc = wrongCount + 1;
      setWrongCount(wc);
      if (wc >= MAX_WRONG) { setStatus('lost'); onComplete?.(false, wc); }
    }
  }, [status, guessed, target, letters, wrongCount, onComplete]);

  useEffect(() => {
    const handle = (e) => {
      const k = e.key.toUpperCase();
      if (LETTER_KEY_REGEX.test(e.key)) guess(k);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [guess]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 pb-8">
      {/* Робот собирается по мере ошибок */}
      <div className="w-[200px] h-[200px]">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <AnimatePresence>
            {ROBOT_PARTS.slice(0, wrongCount).map(([key, node]) => (
              <motion.g key={key} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                {node}
              </motion.g>
            ))}
          </AnimatePresence>
        </svg>
      </div>

      {/* Word display */}
      <div className="flex flex-wrap justify-center gap-2">
        {target.split('').map((ch, i) => (
          <div key={i} className="w-10 h-12 flex items-center justify-center border-b-4 border-black dark:border-white font-black text-2xl uppercase">
            {guessed.has(ch) || status !== 'playing' ? ch : ''}
          </div>
        ))}
      </div>

      <p className="font-black text-sm uppercase text-slate-500 dark:text-slate-400">{t.wrong}: {wrongCount} / {MAX_WRONG}</p>

      {status !== 'playing' && (
        <div className={`w-full p-5 rounded-2xl border-4 text-center ${status === 'won' ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 border-red-400 text-red-700 dark:text-red-300'}`}>
          <div className="flex justify-center mb-2">
            {status === 'won' ? <CheckCircle size={36} /> : <XCircle size={36} />}
          </div>
          <p className="font-black text-xl mb-1">{status === 'won' ? t.won : t.lost}</p>
          {status === 'lost' && <p className="font-bold text-sm">{t.theWord} <span className="font-black">{target}</span></p>}
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={onExit} className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-black text-sm uppercase">
              {t.exit}
            </button>
            <button onClick={() => { setGuessed(new Set()); setWrongCount(0); setStatus('playing'); onComplete?.(null); }}
              className="px-5 py-2 border-2 border-black dark:border-white rounded-xl font-black text-sm uppercase flex items-center gap-2">
              <RotateCcw size={14} /> {t.again}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5 w-full">
        {keyboard.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.filter((k) => k !== 'ENTER' && k !== '⌫').map((key) => {
              const used = guessed.has(key);
              const isRight = used && target.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => guess(key)}
                  disabled={used || status !== 'playing'}
                  className={`w-9 h-12 rounded-lg font-black text-sm uppercase select-none transition-all active:scale-95
                    ${used ? (isRight ? 'bg-green-500 text-white' : 'bg-zinc-400 text-white') : 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-white'}
                  `}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
