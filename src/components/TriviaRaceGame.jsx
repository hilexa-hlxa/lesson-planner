import { useState } from 'react';
import { CheckCircle, Flag } from 'lucide-react';
import TriviaRaceBoard from './TriviaRaceBoard';

const T = {
  RU: { finished: 'Финиш!', position: 'Ты на клетке', of: 'из' },
  KZ: { finished: 'Финиш!', position: 'Сен мына торда', of: '/' },
  EN: { finished: 'Finished!', position: 'You reached tile', of: 'of' },
};

// questions — без правильных ответов (см. QuizParser::withoutAnswers); верный
// вариант узнаём только из ответа /api/trivia-race/answer, как и в QuizPlayer.
export default function TriviaRaceGame({ questions, boardLength, playerId, players, lang = 'RU', onAnswer, onFinish, onExit }) {
  const t = T[lang] || T.RU;
  const [answeredCount, setAnsweredCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(null);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalPos, setFinalPos] = useState(null);

  const current = questions[answeredCount % questions.length];

  const pick = async (optionIndex) => {
    if (busy || revealed) return;
    setBusy(true);
    setSelected(optionIndex);
    try {
      const r = await onAnswer(answeredCount, optionIndex);
      setRevealed({ correctIndex: r.correct_index, isCorrect: r.is_correct });
      setTimeout(() => {
        if (r.finished) {
          setFinished(true);
          setFinalPos(r.position);
          onFinish?.(r.position);
        } else {
          setAnsweredCount((c) => c + 1);
          setSelected(null);
          setRevealed(null);
        }
      }, 900);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto px-4 pb-8">
      <TriviaRaceBoard boardLength={boardLength} players={players} currentPlayerId={playerId} />

      {finished ? (
        <div className="w-full p-6 rounded-2xl border-4 border-black dark:border-white bg-white dark:bg-zinc-900 text-center">
          <div className="flex justify-center mb-2"><Flag size={36} className="text-amber-500" /></div>
          <p className="font-black text-xl mb-1">{t.finished}</p>
          <p className="font-bold text-sm text-slate-500">{t.position} {finalPos} {t.of} {boardLength}</p>
          <button onClick={onExit} className="mt-4 px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-black text-sm uppercase">
            OK
          </button>
        </div>
      ) : (
        <div className="w-full p-6 md:p-8 bg-white dark:bg-zinc-900 rounded-[28px] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000]">
          <p className="font-black text-lg sm:text-xl mb-5">{current.question}</p>
          <div className="flex flex-col gap-3">
            {current.options.map((opt, i) => {
              let cls = 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700';
              if (revealed) {
                if (i === revealed.correctIndex) cls = 'bg-green-500 text-white';
                else if (i === selected) cls = 'bg-red-400 text-white';
                else cls = 'bg-slate-100 dark:bg-zinc-800 opacity-50';
              }
              return (
                <button key={i} onClick={() => pick(i)} disabled={!!revealed}
                  className={`text-left px-5 py-3 rounded-2xl border-[3px] border-black dark:border-white font-bold transition-all flex items-center justify-between ${cls}`}>
                  {opt}
                  {revealed && i === revealed.correctIndex && <CheckCircle size={18} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
