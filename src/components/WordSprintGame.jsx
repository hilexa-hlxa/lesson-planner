import { useState, useEffect, useRef } from 'react';
import { CheckCircle, RotateCcw, Gauge } from 'lucide-react';

const T = {
  RU: { wpm: 'слов/мин', accuracy: 'точность', done: 'Готово!', again: 'Ещё раз', exit: 'Выход', placeholder: 'Начни печатать здесь…' },
  KZ: { wpm: 'сөз/мин', accuracy: 'дәлдік', done: 'Дайын!', again: 'Тағы да', exit: 'Шығу', placeholder: 'Осында теруді баста…' },
  EN: { wpm: 'wpm', accuracy: 'accuracy', done: 'Done!', again: 'Play again', exit: 'Exit', placeholder: 'Start typing here…' },
};

export default function WordSprintGame({ sentence, lang = 'RU', onFinish, onExit, onReplay }) {
  const t = T[lang] || T.RU;
  const [typed, setTyped] = useState('');
  const [startedAt, setStartedAt] = useState(null);
  const [status, setStatus] = useState('playing'); // 'playing' | 'done'
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleChange = (e) => {
    if (status !== 'playing') return;
    const value = e.target.value.slice(0, sentence.length);
    if (!startedAt && value.length > 0) setStartedAt(Date.now());
    setTyped(value);

    if (value.length === sentence.length) {
      // Пол в 300мс — не для честного игрока (никто не наберёт предложение
      // быстрее физически), а для Date.now()-разницы в доли миллисекунды:
      // без пола она однажды дала 8830 слов/мин и с чистой совестью выдала
      // ачивку word_sprint_ace за результат, невозможный для человека.
      const elapsedMs = Math.max(300, Date.now() - (startedAt || Date.now()));
      const minutes = elapsedMs / 60000;
      let correct = 0;
      for (let i = 0; i < sentence.length; i++) if (value[i] === sentence[i]) correct++;
      const accuracy = Math.round((correct / sentence.length) * 100);
      // 250 слов/мин — выше мирового рекорда на клавиатуре; всё, что "быстрее",
      // это не более быстрый ученик, а вставка текста или сбой таймера
      const wpm = Math.min(250, Math.round((sentence.length / 5) / minutes));

      setStatus('done');
      setResult({ wpm, accuracy });
      // score выше = лучше: тянем и скорость, и точность в один показатель для game_scores
      const score = Math.round(wpm * (accuracy / 100));
      onFinish?.(score, { wpm, accuracy });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4 pb-8">
      <div className="w-full p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-[28px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000]">
        <p className="text-xl sm:text-2xl font-mono font-bold leading-relaxed tracking-wide">
          {sentence.split('').map((ch, i) => {
            let cls = 'text-slate-400 dark:text-zinc-600';
            if (i < typed.length) cls = typed[i] === ch ? 'text-sky-500' : 'text-red-500 bg-red-100 dark:bg-red-900/40';
            else if (i === typed.length) cls = 'text-slate-900 dark:text-white underline';
            return <span key={i} className={cls}>{ch}</span>;
          })}
        </p>
      </div>

      {status === 'playing' && (
        <input
          ref={inputRef}
          value={typed}
          onChange={handleChange}
          placeholder={t.placeholder}
          autoComplete="off" autoCorrect="off" spellCheck="false"
          className="w-full p-4 text-lg font-mono border-4 border-black dark:border-white rounded-2xl bg-slate-100 dark:bg-zinc-800 outline-none"
        />
      )}

      {status === 'done' && result && (
        <div className="w-full p-6 rounded-2xl border-4 border-black dark:border-white bg-white dark:bg-zinc-900 text-center">
          <div className="flex justify-center mb-2"><CheckCircle size={36} className="text-sky-500" /></div>
          <p className="font-black text-xl mb-3">{t.done}</p>
          <div className="flex justify-center gap-8 mb-2">
            <div>
              <div className="text-3xl font-black flex items-center gap-1 justify-center"><Gauge size={22} />{result.wpm}</div>
              <div className="text-xs font-bold uppercase text-slate-400">{t.wpm}</div>
            </div>
            <div>
              <div className="text-3xl font-black">{result.accuracy}%</div>
              <div className="text-xs font-bold uppercase text-slate-400">{t.accuracy}</div>
            </div>
          </div>
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
