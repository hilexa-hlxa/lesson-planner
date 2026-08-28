import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Hash, User, ChevronLeft, AlertCircle } from 'lucide-react';
import api from '../api';

const T = {
  RU: {
    title: "Вход в Тест", sub: "Введи код и имя",
    codeLabel: "Код доступа", nameLabel: "Твое имя", namePh: "Иван Иванов",
    searching: "Поиск...", start: "Начать",
    notFound: "Сессия не найдена. Проверьте код у учителя.",
    badData: "Не удалось загрузить тест. Попросите учителя перезапустить сессию.",
    expired: "Сессия теста завершена. Попросите учителя запустить её заново.",
    alreadyDone: "Под этим именем тест уже пройден. Возьмите другое имя или спросите учителя.",
    tooMany: "Слишком много попыток. Подождите несколько минут и попробуйте снова.",
    network: "Нет связи с сервером. Проверьте интернет и попробуйте снова.",
  },
  KZ: {
    title: "Тестке кіру", sub: "Кодты және атыңызды енгізіңіз",
    codeLabel: "Қатынау коды", nameLabel: "Атыңыз", namePh: "Айдана Серік",
    searching: "Іздеу...", start: "Бастау",
    notFound: "Сессия табылмады. Кодты мұғалімнен тексеріңіз.",
    badData: "Тестті жүктеу мүмкін болмады. Мұғалімнен сессияны қайта іске қосуын сұраңыз.",
    expired: "Тест сессиясы аяқталды. Мұғалімнен қайта іске қосуын сұраңыз.",
    alreadyDone: "Бұл атпен тест тапсырылып қойған. Басқа ат алыңыз немесе мұғалімнен сұраңыз.",
    tooMany: "Тым көп әрекет. Бірнеше минут күтіп, қайталаңыз.",
    network: "Сервермен байланыс жоқ. Интернетті тексеріп, қайталаңыз.",
  },
  EN: {
    title: "Join a Quiz", sub: "Enter the code and your name",
    codeLabel: "Access code", nameLabel: "Your name", namePh: "Alex Smith",
    searching: "Searching...", start: "Start",
    notFound: "Session not found. Check the code with your teacher.",
    badData: "Could not load the quiz. Ask your teacher to restart the session.",
    expired: "This quiz session has ended. Ask your teacher to start it again.",
    alreadyDone: "This name has already finished the quiz. Use another name or ask your teacher.",
    tooMany: "Too many attempts. Wait a few minutes and try again.",
    network: "No connection to the server. Check your internet and try again.",
  },
};

const StudentJoinPage = ({ lang = "RU", user = null }) => {
  const t = T[lang] || T.RU;
  // Гость сюда попадает по ссылке от учителя — возвращать его в игротеку
  // (закрытый раздел) незачем, там его развернёт обратно
  const backTo = user ? "/games" : "/";

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code || !name) return;

    const trimmedCode = code.trim();
    setLoading(true);
    setError("");
    try {
      const data = await api.quiz.join(trimmedCode, name.trim());
      const quizData = data.data?.quiz || data.quiz;
      const attemptToken = data.attempt_token || data.data?.attempt_token;

      if (!quizData?.questions?.length || !attemptToken) {
        setError(t.badData);
        return;
      }

      // Токен попытки нужен дальше: им подтверждается каждый ответ и отправка
      localStorage.setItem('student_quiz_session', JSON.stringify({
        quiz: quizData,
        attemptToken,
        studentName: name.trim(),
        startTime: Date.now()
      }));

      navigate('/play');

    } catch (err) {
      if (err?.status === 404) setError(t.notFound);
      else if (err?.status === 410) setError(t.expired);
      else if (err?.status === 409) setError(t.alreadyDone);
      else if (err?.status === 429) setError(t.tooMany);
      else if (err?.status === 422) setError(t.badData);
      else {
        console.error(err);
        setError(t.network);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center p-5 sm:p-6 font-sans relative">

      {/* === КНОПКА НАЗАД === */}
      <Link
        to={backTo}
        className="absolute top-5 left-5 sm:top-6 sm:left-6 p-3 bg-white dark:bg-zinc-800 border-[3px] border-black dark:border-white rounded-2xl shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none transition text-black dark:text-white"
      >
        <ChevronLeft size={24} />
      </Link>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-[8px_8px_0_0_#000] border-[4px] border-black dark:border-gray-700 mt-16 sm:mt-0">
        <h1 className="text-2xl sm:text-3xl font-black uppercase text-center mb-2 dark:text-white">{t.title}</h1>
        <p className="text-center text-gray-500 font-bold text-xs uppercase tracking-widest mb-8">
          {t.sub}
        </p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="join-code" className="block text-xs font-black uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">{t.codeLabel}</label>
            <div className="relative">
              <Hash className="absolute left-4 top-4 text-gray-500 dark:text-gray-400" size={20} />
              <input
                id="join-code"
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(""); }}
                placeholder="0000"
                className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-black text-2xl tracking-[0.2em] outline-none focus:ring-4 ring-emerald-500/20 transition text-center dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="join-name" className="block text-xs font-black uppercase text-gray-500 dark:text-gray-400 mb-2 ml-1">{t.nameLabel}</label>
            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-500 dark:text-gray-400" size={20} />
              <input
                id="join-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder={t.namePh}
                className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold text-lg outline-none focus:ring-4 ring-emerald-500/20 transition dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 4 || !name}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t.searching : t.start} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentJoinPage;
