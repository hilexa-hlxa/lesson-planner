import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { KEYBOARDS, LETTER_KEY_REGEX } from '../lib/keyboards';

const MAX_GUESSES = 6;

function evaluateGuess(guess, target) {
  const result = Array(target.length).fill('absent');
  const tArr = target.split('');
  const gArr = guess.split('');
  const used = Array(target.length).fill(false);

  for (let i = 0; i < gArr.length; i++) {
    if (gArr[i] === tArr[i]) { result[i] = 'correct'; used[i] = true; }
  }
  for (let i = 0; i < gArr.length; i++) {
    if (result[i] === 'correct') continue;
    const j = tArr.findIndex((c, idx) => c === gArr[i] && !used[idx]);
    if (j !== -1) { result[i] = 'present'; used[j] = true; }
  }
  return result;
}

const STATE_COLORS = {
  correct: 'bg-green-500 border-green-500 text-white',
  present: 'bg-yellow-400 border-yellow-400 text-white',
  absent:  'bg-zinc-500 border-zinc-500 text-white',
  empty:   'border-slate-300 dark:border-zinc-600',
  active:  'border-slate-600 dark:border-zinc-300',
};

const KEY_COLORS = {
  correct: 'bg-green-500 text-white',
  present: 'bg-yellow-400 text-white',
  absent:  'bg-zinc-500 text-white dark:bg-zinc-600',
  default: 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-white',
};

export default function WordleGame({ word, lang = 'RU', onComplete, onExit }) {
  const wordLen = word.length;
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [shake, setShake] = useState(false);
  const [letterStates, setLetterStates] = useState({});

  const keyboard = KEYBOARDS[lang] || KEYBOARDS.RU;

  const submit = useCallback(() => {
    if (current.length !== wordLen) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const evaluation = evaluateGuess(current, word);
    const newGuesses = [...guesses, current];
    const newResults = [...results, evaluation];

    setGuesses(newGuesses);
    setResults(newResults);
    setCurrent('');

    // Update letter states
    setLetterStates(prev => {
      const next = { ...prev };
      const priority = { correct: 3, present: 2, absent: 1 };
      current.split('').forEach((ch, i) => {
        const s = evaluation[i];
        if ((priority[s] || 0) > (priority[next[ch]] || 0)) next[ch] = s;
      });
      return next;
    });

    const won = evaluation.every(s => s === 'correct');
    if (won) {
      setStatus('won');
      onComplete?.(true, newGuesses.length);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setStatus('lost');
      onComplete?.(false, newGuesses.length);
    }
  }, [current, guesses, results, word, wordLen, onComplete]);

  const pressKey = useCallback((key) => {
    if (status !== 'playing') return;
    if (key === 'ENTER') { submit(); return; }
    if (key === '⌫' || key === 'BACKSPACE') {
      setCurrent(p => p.slice(0, -1));
      return;
    }
    if (current.length < wordLen) setCurrent(p => p + key.toUpperCase());
  }, [status, submit, current, wordLen]);

  useEffect(() => {
    const handle = (e) => {
      const k = e.key.toUpperCase();
      if (k === 'ENTER') { pressKey('ENTER'); return; }
      if (k === 'BACKSPACE') { pressKey('⌫'); return; }
      if (LETTER_KEY_REGEX.test(e.key)) pressKey(k);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [pressKey]);

  const T = {
    RU: { won: 'Отлично!', lost: 'Не угадал', theWord: 'Слово было:', tries: 'Попыток', again: 'Снова', exit: 'Выход', invalidLen: `Слово должно быть ${wordLen} букв` },
    KZ: { won: 'Керемет!', lost: 'Таппадың', theWord: 'Сөз болды:', tries: 'Әрекет', again: 'Қайта', exit: 'Шығу', invalidLen: `Сөз ${wordLen} әріптен тұруы керек` },
    EN: { won: 'Excellent!', lost: 'Better luck next time', theWord: 'The word was:', tries: 'Tries', again: 'Play Again', exit: 'Exit', invalidLen: `Word must be ${wordLen} letters` },
  };
  const t = T[lang] || T.RU;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 pb-8">
      {/* Grid */}
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: MAX_GUESSES }).map((_, row) => {
          const isCurrentRow = row === guesses.length;
          const isDoneRow = row < guesses.length;
          const guess = isDoneRow ? guesses[row] : isCurrentRow ? current : '';
          const rowResult = isDoneRow ? results[row] : null;

          return (
            <div
              key={row}
              className={`flex gap-1.5 ${isCurrentRow && shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
            >
              {Array.from({ length: wordLen }).map((_, col) => {
                const ch = guess[col] || '';
                const state = rowResult ? rowResult[col] : ch ? 'active' : 'empty';
                return (
                  <div
                    key={col}
                    className={`w-14 h-14 flex items-center justify-center border-2 rounded-xl font-black text-2xl uppercase transition-all
                      ${rowResult ? STATE_COLORS[state] : ch ? STATE_COLORS.active + ' border-slate-500 dark:border-zinc-300' : STATE_COLORS.empty}
                    `}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Status banner */}
      {status !== 'playing' && (
        <div className={`w-full p-5 rounded-2xl border-4 text-center ${status === 'won' ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 border-red-400 text-red-700 dark:text-red-300'}`}>
          <div className="flex justify-center mb-2">
            {status === 'won' ? <CheckCircle size={36}/> : <XCircle size={36}/>}
          </div>
          <p className="font-black text-xl mb-1">{t.won !== t.lost && status === 'won' ? t.won : t.lost}</p>
          {status === 'lost' && <p className="font-bold text-sm">{t.theWord} <span className="font-black">{word}</span></p>}
          {status === 'won' && <p className="font-bold text-sm">{t.tries}: {guesses.length} / {MAX_GUESSES}</p>}
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={onExit} className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-black text-sm uppercase">
              {t.exit}
            </button>
            <button onClick={() => { setGuesses([]); setCurrent(''); setResults([]); setStatus('playing'); setLetterStates({}); onComplete?.(null); }}
              className="px-5 py-2 border-2 border-black dark:border-white rounded-xl font-black text-sm uppercase flex items-center gap-2">
              <RotateCcw size={14}/> {t.again}
            </button>
          </div>
        </div>
      )}

      {/* Keyboard */}
      <div className="flex flex-col gap-1.5 w-full">
        {keyboard.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map((key) => {
              const isSpecial = key === 'ENTER' || key === '⌫';
              const state = !isSpecial ? letterStates[key] : null;
              return (
                <button
                  key={key}
                  onClick={() => pressKey(key)}
                  className={`
                    ${isSpecial ? 'px-3 text-xs min-w-[52px]' : 'w-9'}
                    h-12 rounded-lg font-black text-sm uppercase select-none transition-all active:scale-95
                    ${state ? KEY_COLORS[state] : KEY_COLORS.default}
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
