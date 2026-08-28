import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TriviaRaceGame from '../components/TriviaRaceGame';
import TriviaRaceBoard from '../components/TriviaRaceBoard';
import api from '../api';

const T = {
  RU: {
    title: 'ГОНКА ЭРУДИТОВ',
    classJoin: 'Войти в гонку',
    classJoinDesc: 'Введи 4-значный код учителя.',
    classHost: 'Провести гонку',
    classHostDesc: 'Выбери один из своих Тестов.',
    codePlaceholder: '4-значный код',
    yourName: 'Твоё имя',
    join: 'Войти',
    createCode: 'Создать код',
    generating: '...',
    codeFor: 'Код для учеников:',
    share: 'Поделись этим кодом со своим классом!',
    pickTest: 'Выбери Тест',
    noTests: 'У тебя пока нет ни одного Теста.',
    back: 'Назад',
  },
  KZ: {
    title: 'БІЛГІРЛЕР ЖАРЫСЫ',
    classJoin: 'Жарысқа кіру',
    classJoinDesc: 'Мұғалімнің 4 санды кодын енгіз.',
    classHost: 'Жарыс өткізу',
    classHostDesc: 'Тесттеріңнің бірін таңда.',
    codePlaceholder: '4 санды код',
    yourName: 'Атың',
    join: 'Кіру',
    createCode: 'Код жасау',
    generating: '...',
    codeFor: 'Оқушыларға код:',
    share: 'Бұл кодты сыныбыңмен бөліс!',
    pickTest: 'Тестті таңда',
    noTests: 'Сенде әзірге бір де Тест жоқ.',
    back: 'Артқа',
  },
  EN: {
    title: 'TRIVIA RACE',
    classJoin: 'Join a Race',
    classJoinDesc: "Enter your teacher's 4-digit code.",
    classHost: 'Host a Race',
    classHostDesc: 'Pick one of your Tests.',
    codePlaceholder: '4-digit code',
    yourName: 'Your name',
    join: 'Join',
    createCode: 'Create code',
    generating: '...',
    codeFor: 'Code for students:',
    share: 'Share this code with your class!',
    pickTest: 'Pick a Test',
    noTests: "You don't have any Tests yet.",
    back: 'Back',
  },
};

export default function TriviaRacePage({ lang, setLang, user, setUser, grantAchievement, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();
  const isTeacher = user?.role === 'teacher';

  const [mode, setMode] = useState(null); // null | 'join' | 'host'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Student join
  const [joinCode, setJoinCode] = useState('');
  const [studentName, setStudentName] = useState(user?.display_name || '');
  const [game, setGame] = useState(null); // {questions, boardLength, playerId, sessionId}

  // Teacher host
  const [tests, setTests] = useState([]);
  const [hostCode, setHostCode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [boardLength, setBoardLength] = useState(20);

  const [players, setPlayers] = useState([]);
  const pollRef = useRef(null);
  const finishedGrantedRef = useRef(false);

  useEffect(() => {
    if (mode === 'host' && isTeacher && !hostCode) {
      api.tests.list().then((r) => setTests(r.items || [])).catch(() => {});
    }
  }, [mode, isTeacher, hostCode]);

  const activeSessionId = sessionId || game?.sessionId;
  useEffect(() => {
    if (!activeSessionId) return;
    const poll = async () => {
      try {
        const r = await api.triviaRace.state(activeSessionId);
        setPlayers(r.players || []);
      } catch { /* transient poll errors are fine to skip */ }
    };
    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => clearInterval(pollRef.current);
  }, [activeSessionId]);

  const hostRace = async (quizId) => {
    setLoading(true); setError('');
    try {
      const r = await api.triviaRace.createSession(quizId);
      setHostCode(r.code);
      setSessionId(r.session_id);
      setBoardLength(r.board_length);
    } catch (e) {
      setError(e.message || 'Error');
    } finally { setLoading(false); }
  };

  const joinRace = async () => {
    if (joinCode.length !== 4) return;
    setLoading(true); setError('');
    try {
      const r = await api.triviaRace.join(joinCode, studentName || 'Guest');
      setGame({ questions: r.questions, boardLength: r.board_length, playerId: r.player_id, sessionId: r.session_id });
    } catch (e) {
      setError(e.message || 'Session not found');
    } finally { setLoading(false); }
  };

  const handleAnswer = (index, selected) => api.triviaRace.answer(game.playerId, index, selected);

  const handleFinish = () => {
    if (finishedGrantedRef.current) return;
    finishedGrantedRef.current = true;
    const finishedCount = players.filter((p) => p.finished).length;
    if (finishedCount <= 1 && players.length >= 3) grantAchievement?.('trivia_champion');
  };

  const reset = () => {
    setMode(null); setGame(null); setHostCode(null); setSessionId(null);
    setJoinCode(''); setError(''); setPlayers([]); finishedGrantedRef.current = false;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} grantAchievement={grantAchievement} {...accessProps} />

      <main className="max-w-2xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={game || mode ? reset : () => navigate(-1)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        {game ? (
          <TriviaRaceGame
            questions={game.questions} boardLength={game.boardLength} playerId={game.playerId}
            players={players} lang={lang} onAnswer={handleAnswer} onFinish={handleFinish} onExit={reset}
          />
        ) : mode === null ? (
          <div className="flex flex-col gap-4">
            {!isTeacher && (
              <button onClick={() => setMode('join')}
                className="group p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex items-start gap-5">
                <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0"><Users size={28} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase mb-1">{t.classJoin}</h3>
                  <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t.classJoinDesc}</p>
                </div>
              </button>
            )}
            {isTeacher && (
              <button onClick={() => setMode('host')}
                className="group p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex items-start gap-5">
                <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center shrink-0"><ListChecks size={28} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase mb-1">{t.classHost}</h3>
                  <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t.classHostDesc}</p>
                </div>
              </button>
            )}
          </div>
        ) : mode === 'join' ? (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            <h2 className="font-black text-xl uppercase mb-6">{t.classJoin}</h2>
            <input
              value={studentName} onChange={(e) => setStudentName(e.target.value)}
              placeholder={t.yourName}
              aria-label={t.yourName}
              className="w-full p-4 font-bold border-4 border-black dark:border-white rounded-2xl bg-slate-100 dark:bg-zinc-800 mb-3 outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder={t.codePlaceholder}
              aria-label={t.codePlaceholder}
              className="w-full text-center text-2xl sm:text-4xl font-mono font-black p-4 border-4 border-black dark:border-white rounded-2xl bg-slate-100 dark:bg-zinc-800 tracking-[0.5em] mb-4 outline-none focus:ring-2 focus:ring-emerald-500/40"
              maxLength={4}
            />
            {error && <p className="text-red-500 font-bold text-sm mb-3">{error}</p>}
            <button onClick={joinRace} disabled={loading || joinCode.length !== 4}
              className="w-full py-4 bg-amber-500 text-white font-black text-lg uppercase rounded-2xl border-4 border-black dark:border-white disabled:opacity-40 transition-opacity">
              {loading ? t.generating : t.join}
            </button>
          </div>
        ) : mode === 'host' ? (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            <h2 className="font-black text-xl uppercase mb-6">{t.classHost}</h2>

            {!hostCode ? (
              <>
                <p className="font-black text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">{t.pickTest}</p>
                {tests.length === 0 && <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-3">{t.noTests}</p>}
                <div className="flex flex-col gap-2 mb-4">
                  {tests.map((qz) => (
                    <button key={qz.id} onClick={() => hostRace(qz.id)} disabled={loading}
                      className="text-left px-4 py-3 rounded-xl border-[3px] border-black dark:border-white font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40">
                      {qz.topic || qz.subject || `#${qz.id}`}
                    </button>
                  ))}
                </div>
                {error && <p className="text-red-500 font-bold text-sm mb-3">{error}</p>}
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <p className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase mb-2">{t.codeFor}</p>
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-mono font-black tracking-[0.2em] sm:tracking-[0.3em] break-all text-amber-500 mb-2">{hostCode}</div>
                  <p className="text-slate-500 font-bold text-sm">{t.share}</p>
                </div>
                <TriviaRaceBoard boardLength={boardLength} players={players} currentPlayerId={null} />
              </>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
