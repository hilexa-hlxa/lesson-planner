import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Zap, Users, User, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MathBattleGame from '../components/MathBattleGame';
import api from '../api';

const T = {
  RU: {
    title: 'БИТВА ЧИСЕЛ',
    solo: 'Тренировка',
    soloDesc: '60 секунд, реши как можно больше примеров.',
    classJoin: 'Войти в дуэль класса',
    classJoinDesc: 'Введи 4-значный код учителя.',
    classHost: 'Провести дуэль',
    classHostDesc: 'Выбери класс — поделись кодом.',
    grade: 'Класс',
    codePlaceholder: '4-значный код',
    start: 'Начать',
    join: 'Войти',
    createCode: 'Создать код',
    generating: '...',
    codeFor: 'Код для учеников:',
    share: 'Поделись этим кодом со своим классом!',
    leaderboard: 'Таблица результатов',
    back: 'Назад',
  },
  KZ: {
    title: 'САНДАР ШАЙҚАСЫ',
    solo: 'Жаттығу',
    soloDesc: '60 секунд, мүмкіндігінше көп мысал шеш.',
    classJoin: 'Сынып дуэліне кіру',
    classJoinDesc: 'Мұғалімнің 4 санды кодын енгіз.',
    classHost: 'Дуэль өткізу',
    classHostDesc: 'Сыныпты таңда — кодты бөліс.',
    grade: 'Сынып',
    codePlaceholder: '4 санды код',
    start: 'Бастау',
    join: 'Кіру',
    createCode: 'Код жасау',
    generating: '...',
    codeFor: 'Оқушыларға код:',
    share: 'Бұл кодты сыныбыңмен бөліс!',
    leaderboard: 'Нәтижелер кестесі',
    back: 'Артқа',
  },
  EN: {
    title: 'MATH BATTLE',
    solo: 'Practice',
    soloDesc: '60 seconds, solve as many problems as you can.',
    classJoin: 'Join Class Duel',
    classJoinDesc: "Enter your teacher's 4-digit code.",
    classHost: 'Host a Duel',
    classHostDesc: 'Pick a grade — share the code.',
    grade: 'Grade',
    codePlaceholder: '4-digit code',
    start: 'Start',
    join: 'Join',
    createCode: 'Create code',
    generating: '...',
    codeFor: 'Code for students:',
    share: 'Share this code with your class!',
    leaderboard: 'Leaderboard',
    back: 'Back',
  },
};

export default function MathBattlePage({ lang, setLang, user, setUser, grantAchievement, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [mode, setMode] = useState(null); // null | 'solo' | 'join' | 'host'
  const [problems, setProblems] = useState(null);
  const [gameMode, setGameMode] = useState('solo'); // engine mode: 'solo' | 'duel'
  const [playerId, setPlayerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [grade, setGrade] = useState(5);

  const isTeacher = user?.role === 'teacher';

  const reset = () => {
    setMode(null); setProblems(null); setPlayerId(null);
    setHostCode(null); setSessionId(null); setJoinCode(''); setError('');
  };

  // Solo
  const startSolo = useCallback(async (g = grade) => {
    setLoading(true); setError('');
    try {
      const r = await api.mathBattle.practice(g, 15);
      setGameMode('solo');
      setProblems(r.problems);
    } catch (e) {
      setError(e.message || 'Error');
    } finally { setLoading(false); }
  }, [grade]);

  // Join duel (student)
  const [joinCode, setJoinCode] = useState('');
  const joinDuel = async () => {
    if (joinCode.length !== 4) return;
    setLoading(true); setError('');
    try {
      const r = await api.mathBattle.join(joinCode, user?.display_name || 'Guest');
      setGameMode('duel');
      setPlayerId(r.player_id);
      setSessionId(r.session_id);
      setProblems(r.problems);
    } catch (e) {
      setError(e.message || 'Session not found');
    } finally { setLoading(false); }
  };

  // Host duel (teacher)
  const [hostCode, setHostCode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [standings, setStandings] = useState([]);
  const hostDuel = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.mathBattle.createSession(grade);
      setHostCode(r.code);
      setSessionId(r.session_id);
    } catch (e) {
      setError(e.message || 'Error');
    } finally { setLoading(false); }
  };

  // Teacher polls the live board while hosting
  const pollRef = useRef(null);
  useEffect(() => {
    if (!sessionId || !hostCode) return;
    const poll = async () => {
      try {
        const r = await api.mathBattle.status(sessionId);
        setStandings(r.players || []);
      } catch { /* transient poll errors are fine to skip */ }
    };
    poll();
    pollRef.current = setInterval(poll, 2500);
    return () => clearInterval(pollRef.current);
  }, [sessionId, hostCode]);

  const handleAnswer = async (index, value) => api.mathBattle.answer(playerId, index, value);

  const handleFinish = async (score, meta) => {
    if (gameMode !== 'solo') return; // дуэльный результат уже виден учителю через /status
    try {
      const best = await api.gameScores.best('math_battle');
      if (!best?.best || score > best.best.score) grantAchievement?.('math_whiz');
    } catch { /* достижение необязательно для завершения игры */ }
    api.gameScores.save('math_battle', score, { grade, ...meta }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} grantAchievement={grantAchievement} {...accessProps} />

      <main className="max-w-xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={problems || mode ? reset : () => navigate(-1)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        {problems ? (
          <MathBattleGame
            problems={problems}
            mode={gameMode}
            lang={lang}
            onAnswer={gameMode === 'duel' ? handleAnswer : undefined}
            onFinish={handleFinish}
            onExit={reset}
            onReplay={() => startSolo(grade)}
          />
        ) : mode === null ? (
          <div className="flex flex-col gap-4">
            <button onClick={() => { setMode('solo'); startSolo(); }}
              className="group p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex items-start gap-5">
              <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center shrink-0"><Zap size={28} /></div>
              <div>
                <h3 className="text-xl font-black uppercase mb-1">{t.solo}</h3>
                <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t.soloDesc}</p>
              </div>
            </button>

            {!isTeacher && (
              <button onClick={() => setMode('join')}
                className="group p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex items-start gap-5">
                <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shrink-0"><Users size={28} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase mb-1">{t.classJoin}</h3>
                  <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t.classJoinDesc}</p>
                </div>
              </button>
            )}

            {isTeacher && (
              <button onClick={() => setMode('host')}
                className="group p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex items-start gap-5">
                <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center shrink-0"><Users size={28} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase mb-1">{t.classHost}</h3>
                  <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t.classHostDesc}</p>
                </div>
              </button>
            )}
          </div>
        ) : mode === 'solo' ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-2xl font-black animate-pulse">{loading ? t.generating : error || ''}</div>
          </div>
        ) : mode === 'join' ? (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            <h2 className="font-black text-xl uppercase mb-6">{t.classJoin}</h2>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder={t.codePlaceholder}
              aria-label={t.codePlaceholder}
              className="w-full text-center text-2xl sm:text-4xl font-mono font-black p-4 border-4 border-black dark:border-white rounded-2xl bg-slate-100 dark:bg-zinc-800 tracking-[0.5em] mb-4 outline-none focus:ring-2 focus:ring-emerald-500/40"
              maxLength={4}
            />
            {error && <p role="alert" className="text-red-500 font-bold text-sm mb-3">{error}</p>}
            <button onClick={joinDuel} disabled={loading || joinCode.length !== 4}
              className="w-full py-4 bg-purple-600 text-white font-black text-lg uppercase rounded-2xl border-4 border-black dark:border-white disabled:opacity-40 transition-opacity">
              {loading ? t.generating : t.join}
            </button>
          </div>
        ) : mode === 'host' ? (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            <h2 className="font-black text-xl uppercase mb-6">{t.classHost}</h2>

            {!hostCode ? (
              <>
                <label className="block font-black text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">{t.grade}</label>
                <select value={grade} onChange={(e) => setGrade(Number(e.target.value))}
                  aria-label={t.grade}
                  className="w-full text-center text-xl font-black p-4 border-4 border-black dark:border-white rounded-2xl bg-slate-100 dark:bg-zinc-800 mb-4 outline-none focus:ring-2 focus:ring-emerald-500/40">
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {error && <p role="alert" className="text-red-500 font-bold text-sm mb-3">{error}</p>}
                <button onClick={hostDuel} disabled={loading}
                  className="w-full py-4 bg-green-600 text-white font-black uppercase rounded-2xl border-4 border-black dark:border-white disabled:opacity-40">
                  {loading ? t.generating : t.createCode}
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <p className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase mb-2">{t.codeFor}</p>
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-mono font-black tracking-[0.2em] sm:tracking-[0.3em] break-all text-rose-500 mb-2">{hostCode}</div>
                  <p className="text-slate-500 font-bold text-sm">{t.share}</p>
                </div>
                <div>
                  <p className="flex items-center gap-2 font-black text-sm uppercase text-slate-500 dark:text-slate-400 mb-2"><Trophy size={16} /> {t.leaderboard}</p>
                  <div className="flex flex-col gap-2">
                    {standings.length === 0 && <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">…</p>}
                    {standings.map((p, i) => (
                      <div key={p.id} className="flex justify-between items-center px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 font-bold">
                        <span>{i + 1}. {p.student_name}</span>
                        <span className="font-black">{p.solved_count}{p.finished_at ? ' 🏁' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
