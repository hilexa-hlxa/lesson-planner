import { useState, useMemo } from 'react';
import { ArrowLeft, Flame, CheckCircle, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactConfetti from 'react-confetti';
import Header from '../components/Header';
import { getDailyChallenge } from '../data/dailyChallengeBank';
import api from '../api';

const T = {
  RU: {
    title: 'ЕЖЕДНЕВНЫЙ ВЫЗОВ', streak: 'Серия дней', done: 'Готово на сегодня!',
    score: 'Правильных ответов', of: 'из', comeBack: 'Возвращайся завтра, чтобы продолжить серию!',
    exit: 'На главную', alreadyDone: 'Ты уже прошёл вызов сегодня.',
  },
  KZ: {
    title: 'КҮНДЕЛІКТІ СЫНАҚ', streak: 'Күндер сериясы', done: 'Бүгінге дайын!',
    score: 'Дұрыс жауаптар', of: '/', comeBack: 'Сериямды жалғастыру үшін ертең қайта кел!',
    exit: 'Басты бетке', alreadyDone: 'Сен бүгінгі сынақты өттің.',
  },
  EN: {
    title: 'DAILY CHALLENGE', streak: 'Day streak', done: 'Done for today!',
    score: 'Correct answers', of: 'of', comeBack: 'Come back tomorrow to keep your streak!',
    exit: 'Back home', alreadyDone: "You've already done today's challenge.",
  },
};

export default function DailyChallengePage({ lang, setLang, user, setUser, grantAchievement, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();
  const questions = useMemo(() => getDailyChallenge(lang), [lang]);

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streakInfo, setStreakInfo] = useState(null);

  const current = questions[index];

  const pick = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (i === current.correctIndex) setCorrectCount((c) => c + 1);
    setTimeout(async () => {
      if (index + 1 >= questions.length) {
        setFinished(true);
        try {
          const r = await api.streak.complete();
          setStreakInfo(r);
          if (r.current_streak >= 30) grantAchievement?.('streak_30');
          else if (r.current_streak >= 7) grantAchievement?.('streak_7');
          else if (r.current_streak >= 3) grantAchievement?.('streak_3');
        } catch { /* гость без аккаунта — серию посчитать негде, это не ошибка сценария */ }
      } else {
        setIndex((idx) => idx + 1);
        setSelected(null);
        setRevealed(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} grantAchievement={grantAchievement} {...accessProps} />
      {finished && <ReactConfetti recycle={false} numberOfPieces={400} />}

      <main className="max-w-xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/hub')} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        {!finished ? (
          <>
            <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-orange-500 transition-all" style={{ width: `${((index) / questions.length) * 100}%` }} />
            </div>
            <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 rounded-[30px] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000]">
              <p className="font-black text-lg sm:text-xl mb-5">{current.q}</p>
              <div className="flex flex-col gap-3">
                {current.options.map((opt, i) => {
                  let cls = 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700';
                  if (revealed) {
                    if (i === current.correctIndex) cls = 'bg-green-500 text-white';
                    else if (i === selected) cls = 'bg-red-400 text-white';
                    else cls = 'bg-slate-100 dark:bg-zinc-800 opacity-50';
                  }
                  return (
                    <button key={i} onClick={() => pick(i)} disabled={revealed}
                      className={`text-left px-5 py-3 rounded-2xl border-[3px] border-black dark:border-white font-bold transition-all flex items-center justify-between ${cls}`}>
                      {opt}
                      {revealed && i === current.correctIndex && <CheckCircle size={18} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-4 border-black dark:border-white shadow-[8px_8px_0_0_#000] text-center">
            <Trophy size={48} className="mx-auto mb-3 text-amber-500" />
            <h2 className="text-2xl font-black uppercase mb-2">{t.done}</h2>
            <p className="font-bold text-slate-500 mb-4">{t.score}: {correctCount} {t.of} {questions.length}</p>
            {streakInfo && (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500 font-black text-orange-600 dark:text-orange-300 mb-4">
                <Flame size={22} /> {streakInfo.current_streak} {t.streak}
              </div>
            )}
            <p className="text-sm font-bold text-slate-400 mb-6">{t.comeBack}</p>
            <button onClick={() => navigate('/hub')} className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-black uppercase">
              {t.exit}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
