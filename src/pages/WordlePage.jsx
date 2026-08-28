import { useState } from 'react';
import { ArrowLeft, Shuffle, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import WordleGame from '../components/WordleGame';
import api from '../api';

const T = {
  RU: {
    title: 'ВОРДЛ',
    solo: 'Играть одному',
    soloDesc: 'Угадай случайное слово из банка.',
    classJoin: 'Войти в игру класса',
    classJoinDesc: 'Введи 4-значный код учителя.',
    classHost: 'Провести в классе',
    classHostDesc: 'Задай слово — поделись кодом.',
    wordPlaceholder: 'Введи слово (3-10 букв)',
    codePlaceholder: '4-значный код',
    start: 'Начать',
    join: 'Войти',
    generating: '...',
    codeFor: 'Код для учеников:',
    share: 'Поделись этим кодом со своим классом!',
    result_won: 'Победа!',
    result_lost: 'В следующий раз!',
    back: 'Назад',
    aiSuggest: 'Предложить слово (AI)',
  },
  KZ: {
    title: 'ВОРДЛ',
    solo: 'Жалғыз ойнау',
    soloDesc: 'Сөз банкінен кездейсоқ сөзді тап.',
    classJoin: 'Сынып ойынына кіру',
    classJoinDesc: 'Мұғалімнің 4 санды кодын енгіз.',
    classHost: 'Сыныпта өткізу',
    classHostDesc: 'Сөз берсең — кодты бөліс.',
    wordPlaceholder: 'Сөзді енгіз (3-10 әріп)',
    codePlaceholder: '4 санды код',
    start: 'Бастау',
    join: 'Кіру',
    generating: '...',
    codeFor: 'Оқушыларға код:',
    share: 'Бұл кодты сыныбыңмен бөліс!',
    result_won: 'Жеңіс!',
    result_lost: 'Келесі жолы!',
    back: 'Артқа',
    aiSuggest: 'Сөз ұсыну (AI)',
  },
  EN: {
    title: 'WORDLE',
    solo: 'Play Solo',
    soloDesc: 'Guess a random word from the bank.',
    classJoin: 'Join Class Game',
    classJoinDesc: 'Enter your teacher\'s 4-digit code.',
    classHost: 'Host for Class',
    classHostDesc: 'Set a word — share the code.',
    wordPlaceholder: 'Enter word (3-10 letters)',
    codePlaceholder: '4-digit code',
    start: 'Start',
    join: 'Join',
    generating: '...',
    codeFor: 'Code for students:',
    share: 'Share this code with your class!',
    result_won: 'You won!',
    result_lost: 'Better luck next time!',
    back: 'Back',
    aiSuggest: 'Suggest word (AI)',
  },
};

// mode: null | 'solo' | 'join' | 'host'
// gameState: null | { word, lang }

export default function WordlePage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [mode, setMode] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Solo
  const startSolo = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.wordle.getWord(lang);
      setGameState({ word: r.word, lang });
    } catch (e) {
      setError(e.message || 'Error');
    } finally { setLoading(false); }
  };

  // Join class (student)
  const [joinCode, setJoinCode] = useState('');
  const joinClass = async () => {
    if (joinCode.length !== 4) return;
    setLoading(true); setError('');
    try {
      const r = await api.wordle.joinSession(joinCode);
      setGameState({ word: r.word, lang: r.lang });
    } catch (e) {
      setError(e.message || 'Session not found');
    } finally { setLoading(false); }
  };

  // Host class (teacher)
  const [hostWord, setHostWord] = useState('');
  const [hostCode, setHostCode] = useState(null);
  const hostClass = async () => {
    const w = hostWord.trim().toUpperCase();
    if (w.length < 3) return;
    setLoading(true); setError('');
    try {
      const r = await api.wordle.createSession(w, lang);
      setHostCode(r.code);
    } catch (e) {
      setError(e.message || 'Error');
    } finally { setLoading(false); }
  };
  const startHostGame = () => {
    if (!hostWord.trim()) return;
    setGameState({ word: hostWord.trim().toUpperCase(), lang });
  };

  const reset = () => { setMode(null); setGameState(null); setHostCode(null); setHostWord(''); setJoinCode(''); setError(''); };

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-xl mx-auto px-6">
        {/* Header row */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={gameState || mode ? reset : () => navigate(-1)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        {/* Active game */}
        {gameState ? (
          <WordleGame word={gameState.word} lang={gameState.lang} onExit={reset} />
        ) : mode === null ? (
          /* Mode selection */
          <div className="flex flex-col gap-4">
            {/* Solo */}
            <button onClick={() => { setMode('solo'); startSolo(); }}
              className="group p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex items-start gap-5">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                <User size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase mb-1">{t.solo}</h3>
                <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t.soloDesc}</p>
              </div>
            </button>

            {/* Join class */}
            {!isTeacher && (
              <button onClick={() => setMode('join')}
                className="group p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex items-start gap-5">
                <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase mb-1">{t.classJoin}</h3>
                  <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t.classJoinDesc}</p>
                </div>
              </button>
            )}

            {/* Host class (teacher only) */}
            {isTeacher && (
              <button onClick={() => setMode('host')}
                className="group p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex items-start gap-5">
                <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                  <Users size={28} />
                </div>
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
          /* Student join panel */
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            <h2 className="font-black text-xl uppercase mb-6">{t.classJoin}</h2>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.replace(/\D/g,'').slice(0,4))}
              placeholder={t.codePlaceholder}
              aria-label={t.codePlaceholder}
              className="w-full text-center text-2xl sm:text-4xl font-mono font-black p-4 border-4 border-black dark:border-white rounded-2xl bg-slate-100 dark:bg-zinc-800 tracking-[0.5em] mb-4 outline-none"
              maxLength={4}
            />
            {error && <p className="text-red-500 font-bold text-sm mb-3">{error}</p>}
            <button
              onClick={joinClass}
              disabled={loading || joinCode.length !== 4}
              className="w-full py-4 bg-purple-600 text-white font-black text-lg uppercase rounded-2xl border-4 border-black dark:border-white disabled:opacity-40 transition-opacity"
            >
              {loading ? t.generating : t.join}
            </button>
          </div>
        ) : mode === 'host' ? (
          /* Teacher host panel */
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000]">
            <h2 className="font-black text-xl uppercase mb-6">{t.classHost}</h2>

            {!hostCode ? (
              <>
                <input
                  value={hostWord}
                  onChange={e => setHostWord(e.target.value.toUpperCase())}
                  placeholder={t.wordPlaceholder}
                  aria-label={t.wordPlaceholder}
                  maxLength={10}
                  className="w-full text-center text-2xl font-mono font-black p-4 border-4 border-black dark:border-white rounded-2xl bg-slate-100 dark:bg-zinc-800 tracking-widest mb-4 outline-none uppercase"
                />
                {error && <p className="text-red-500 font-bold text-sm mb-3">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={hostClass}
                    disabled={loading || hostWord.trim().length < 3}
                    className="flex-1 py-4 bg-green-600 text-white font-black uppercase rounded-2xl border-4 border-black dark:border-white disabled:opacity-40"
                  >
                    {loading ? t.generating : 'Создать код'}
                  </button>
                  <button
                    onClick={startHostGame}
                    disabled={hostWord.trim().length < 3}
                    className="flex-1 py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase rounded-2xl border-4 border-black dark:border-white disabled:opacity-40"
                  >
                    {t.start}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <p className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase mb-2">{t.codeFor}</p>
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-mono font-black tracking-[0.2em] sm:tracking-[0.3em] break-all text-emerald-600 mb-2">{hostCode}</div>
                  <p className="text-slate-500 font-bold text-sm">{t.share}</p>
                </div>
                <button
                  onClick={startHostGame}
                  className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-lg rounded-2xl border-4 border-black dark:border-white"
                >
                  {t.start}
                </button>
              </>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
