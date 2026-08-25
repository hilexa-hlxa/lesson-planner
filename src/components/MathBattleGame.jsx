import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, RotateCcw, Delete, Clock } from 'lucide-react';

// Задачу нельзя пропустить неправильным ответом — ни в соло, ни в дуэли.
// В дуэли это буквально диктует бэкенд (answered/solved_count не растёт,
// пока ответ неверный, см. /api/math-battle/answer), а в соло тот же принцип
// оставлен для единообразия: жать "дальше" наугад не должно быть выгоднее,
// чем реально решить пример.

const T = {
  RU: { correct: 'Верно!', done: 'Финиш!', score: 'Решено', of: 'из', timeUp: 'Время вышло', again: 'Ещё раз', exit: 'Выход', waiting: 'Ждём соперника…' },
  KZ: { correct: 'Дұрыс!', done: 'Финиш!', score: 'Шешілді', of: '/', timeUp: 'Уақыт бітті', again: 'Тағы да', exit: 'Шығу', waiting: 'Қарсыласты күтудеміз…' },
  EN: { correct: 'Correct!', done: 'Finished!', score: 'Solved', of: 'of', timeUp: "Time's up", again: 'Play again', exit: 'Exit', waiting: 'Waiting for opponent…' },
};

export default function MathBattleGame({
  problems, mode = 'solo', timeLimitSeconds = 60,
  onAnswer, onFinish, onExit, onReplay, lang = 'RU',
}) {
  const t = T[lang] || T.RU;
  const total = problems.length;

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [status, setStatus] = useState('playing'); // 'playing' | 'done'
  const busyRef = useRef(false);

  const current = problems[index];

  useEffect(() => {
    if (mode !== 'solo' || status !== 'playing') return;
    if (timeLeft <= 0) { setStatus('done'); onFinish?.(correctCount, { total, timedOut: true }); return; }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, status, timeLeft]);

  const advance = useCallback((newCorrectCount, finished) => {
    setFeedback('correct');
    setTimeout(() => {
      setFeedback(null);
      setInput('');
      if (finished) {
        setStatus('done');
        onFinish?.(newCorrectCount, { total });
      } else {
        setIndex((i) => i + 1);
      }
    }, 350);
  }, [total, onFinish]);

  const submit = useCallback(async () => {
    if (busyRef.current || status !== 'playing' || input.trim() === '') return;
    const value = parseInt(input, 10);
    if (Number.isNaN(value)) return;
    busyRef.current = true;

    try {
      if (mode === 'solo') {
        if (value === current.answer) {
          const nc = correctCount + 1;
          setCorrectCount(nc);
          advance(nc, index + 1 >= total);
        } else {
          setFeedback('wrong');
          setInput('');
          setTimeout(() => setFeedback(null), 350);
        }
      } else {
        const r = await onAnswer(index, value);
        if (r?.is_correct) {
          setCorrectCount((c) => c + 1);
          advance(r.solved_count, !!r.finished);
        } else {
          setFeedback('wrong');
          setInput('');
          setTimeout(() => setFeedback(null), 350);
        }
      }
    } finally {
      busyRef.current = false;
    }
  }, [status, input, mode, current, correctCount, index, total, onAnswer, advance]);

  const pressDigit = (d) => { if (status === 'playing') setInput((p) => (p + d).slice(0, 6)); };
  const backspace = () => setInput((p) => p.slice(0, -1));

  useEffect(() => {
    const handle = (e) => {
      if (status !== 'playing') return;
      if (e.key === 'Enter') { submit(); return; }
      if (e.key === 'Backspace') { backspace(); return; }
      if (/^[0-9]$/.test(e.key)) pressDigit(e.key);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
    // pressDigit/backspace only close over setInput — stable enough to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, submit]);

  if (!current && status === 'playing') {
    // Дуэль: соперник ещё не прислал задачи / все решены, а finish не пришёл
    return <div className="py-20 text-center font-black text-xl animate-pulse">{t.waiting}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4 pb-8">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between font-black text-sm mb-2">
          <span>{t.score}: {correctCount} {t.of} {total}</span>
          {mode === 'solo' && (
            <span className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
              <Clock size={16} /> {timeLeft}s
            </span>
          )}
        </div>
        <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-rose-500 transition-all" style={{ width: `${(correctCount / total) * 100}%` }} />
        </div>
      </div>

      {status === 'playing' && current ? (
        <>
          <div className={`w-full p-8 bg-white dark:bg-zinc-900 rounded-[30px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000] text-center transition-colors
            ${feedback === 'correct' ? 'bg-green-50 dark:bg-green-900/30 border-green-500' : ''}
            ${feedback === 'wrong' ? 'bg-red-50 dark:bg-red-900/30 border-red-400 animate-[shake_0.35s_ease-in-out]' : ''}
          `}>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider mb-6">{current.question} = ?</div>
            <div className="text-3xl font-mono font-black min-h-[44px] tracking-widest">{input || ' '}</div>
          </div>

          {/* Numeric keypad — touch-friendly, no dependency on a physical keyboard */}
          <div className="grid grid-cols-3 gap-2 w-full">
            {['1','2','3','4','5','6','7','8','9'].map((d) => (
              <button key={d} onClick={() => pressDigit(d)}
                className="h-14 rounded-2xl font-black text-xl bg-slate-200 dark:bg-zinc-700 active:scale-95 transition-transform">
                {d}
              </button>
            ))}
            <button onClick={backspace} className="h-14 rounded-2xl font-black bg-slate-300 dark:bg-zinc-600 flex items-center justify-center active:scale-95">
              <Delete size={20} />
            </button>
            <button onClick={() => pressDigit('0')} className="h-14 rounded-2xl font-black text-xl bg-slate-200 dark:bg-zinc-700 active:scale-95 transition-transform">0</button>
            <button onClick={submit} className="h-14 rounded-2xl font-black bg-rose-500 text-white active:scale-95">OK</button>
          </div>
        </>
      ) : (
        <div className="w-full p-6 rounded-2xl border-4 border-black dark:border-white bg-white dark:bg-zinc-900 text-center">
          <div className="flex justify-center mb-2">
            {correctCount === total ? <CheckCircle size={36} className="text-green-500" /> : <XCircle size={36} className="text-rose-500" />}
          </div>
          <p className="font-black text-xl mb-1">{t.done}</p>
          <p className="font-bold text-sm text-slate-500">{t.score}: {correctCount} {t.of} {total}</p>
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={onExit} className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-black text-sm uppercase">
              {t.exit}
            </button>
            {mode === 'solo' && onReplay && (
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
