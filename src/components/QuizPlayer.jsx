import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, CheckCircle, XCircle, Trophy, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { parseMarkdownQuiz } from '../lib/quizParser';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ДОБАВИЛИ grantAchievement В ПРОПСЫ
const QuizPlayer = ({ grantAchievement, ...accessProps }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answersLog, setAnswersLog] = useState([]); 

  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem('student_quiz_session');
    if (!raw) { navigate('/join-test'); return; }
    try {
      const data = JSON.parse(raw);
      setSession(data);
      const rawMarkdown = data.quiz.result_md || data.quiz.result;
      const parsed = parseMarkdownQuiz(rawMarkdown);
      if (!parsed || parsed.length === 0) { navigate('/join-test'); return; }
      setQuestions(parsed);
      setLoading(false);
    } catch (e) { navigate('/join-test'); }
  }, [navigate]);

  useEffect(() => {
    if (quizFinished || loading) return;
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setQuestionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [quizFinished, loading]);

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;
    if (isCorrect) setScore(prev => prev + 1);
    setAnswersLog(prev => [...prev, {
      questionId: currentIndex,
      questionText: currentQ.question,
      isCorrect,
      time: questionTime,
      selected: optionIndex,
      selectedText: currentQ.options[optionIndex],
      correctText: currentQ.options[currentQ.correctIndex],
    }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setQuestionTime(0);
    } else {
      // ВЫЗЫВАЕМ ЕДИНУЮ ФУНКЦИЮ ФИНИША
      handleFinishQuiz();
    }
  };

  // --- ЕДИНАЯ ФУНКЦИЯ ЗАВЕРШЕНИЯ (FIXED) ---
  const handleFinishQuiz = async () => {
    setQuizFinished(true);
    clearInterval(timerRef.current);
    
    const percent = (score / questions.length) * 100;

    // 1. Отправка на сервер — ПЕРВЫМ ДЕЛОМ.
    // Результат ученика важнее ачивок: что бы ни случилось дальше, балл уже у учителя.
    try {
        await fetch(`${API_URL}/api/quiz/submit`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_id: session.quiz.id,
                student_name: session.studentName,
                score: score,
                total: questions.length,
                duration: elapsedTime,
                details: answersLog
            })
        });
    } catch (e) {
        console.error("Submission failed", e);
    }

    // 2. Ачивки — только для залогиненных. У гостя аккаунта нет, grantAchievement
    // молча выйдет. Отдельный try, чтобы ошибка здесь не влияла на отправку выше.
    try {
      if (grantAchievement) {
        if (percent === 100 && questions.length >= 5) {
          grantAchievement({ title: "Высший пилотаж", reward: 150, key: "perfect_score" });
        }
        if (elapsedTime < 60 && percent >= 80) {
          grantAchievement({ title: "Сверхзвук", reward: 200, key: "speedrunner" });
        }
      }
    } catch (e) {
      console.error("Achievement grant failed", e);
    }
  };

  const handleExit = () => {
    localStorage.removeItem('student_quiz_session');
    navigate('/join-test');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold dark:text-white">Загрузка...</div>;

  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const wrong = answersLog.filter(a => !a.isCorrect);
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center p-6 font-sans">
        <ReactConfetti recycle={false} numberOfPieces={500} />
        <div className="max-w-lg w-full bg-white dark:bg-zinc-900 p-10 rounded-[40px] shadow-2xl border-[4px] border-black dark:border-white animate-in zoom-in">
           <div className="mb-6 flex justify-center"><Trophy size={64} className="text-yellow-400 fill-yellow-400 animate-bounce" /></div>
           <h1 className="text-4xl font-black uppercase mb-2 dark:text-white text-center">Финиш!</h1>
           <p className="text-gray-500 font-bold uppercase tracking-widest mb-8 text-center">{session.studentName}</p>
           <div className="bg-slate-100 dark:bg-zinc-800 p-6 rounded-2xl mb-6 text-center">
              <div className="text-6xl font-black text-emerald-600 mb-2">{percentage}%</div>
              <p className="font-bold text-sm text-gray-400 uppercase">Правильно: {score} / {questions.length}</p>
              <p className="font-bold text-sm text-gray-400 uppercase mt-1">Время: {elapsedTime}с</p>
           </div>

           {wrong.length > 0 && (
             <div className="mb-6">
               <button
                 onClick={() => setShowBreakdown(v => !v)}
                 className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 font-black text-sm text-red-600 dark:text-red-400"
               >
                 <span>Разбор ошибок ({wrong.length})</span>
                 {showBreakdown ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
               </button>
               {showBreakdown && (
                 <div className="mt-3 space-y-3">
                   {wrong.map((a, i) => (
                     <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-left">
                       <p className="font-bold text-sm mb-2 dark:text-white">
                         {a.questionText || `Вопрос ${a.questionId + 1}`}
                       </p>
                       <p className="text-xs text-red-500 font-bold">
                         Ваш ответ: {a.selectedText || '—'}
                       </p>
                       <p className="text-xs text-green-600 font-bold">
                         Правильно: {a.correctText || '—'}
                       </p>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}

           <button onClick={handleExit} className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 transition">Выход</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-6 md:p-10 font-sans flex flex-col max-w-3xl mx-auto text-slate-900 dark:text-white">
       <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-zinc-700">
             <Timer size={18} className="text-emerald-500" />
             <span className="font-black font-mono text-lg">{elapsedTime}s</span>
          </div>
          <button onClick={handleExit} className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition"><LogOut size={18} /></button>
       </div>

       <div className="w-full h-3 bg-gray-200 dark:bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-emerald-600 transition-all duration-500 ease-out" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
       </div>

       <div className="bg-white dark:bg-zinc-900 p-6 md:p-10 rounded-[30px] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000] mb-6 flex-1">
          <div className="flex justify-between mb-4"><span className="font-black text-gray-400 text-xs uppercase tracking-widest">Вопрос {currentIndex + 1}</span></div>
          <h2 className="text-2xl font-black mb-8 leading-tight">{currentQ.question}</h2>
          <div className="space-y-3">
             {currentQ.options.map((opt, idx) => {
                let stateClass = "border-gray-200 dark:border-zinc-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800";
                if (isAnswered) {
                    if (idx === currentQ.correctIndex) stateClass = "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                    else if (idx === selectedOption) stateClass = "bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400";
                    else stateClass = "opacity-50 border-gray-100 dark:border-zinc-800";
                }
                return (
                   <button key={idx} onClick={() => handleAnswer(idx)} disabled={isAnswered} className={`w-full text-left p-5 rounded-xl border-2 font-bold transition-all duration-200 flex justify-between items-center ${stateClass}`}>
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && <CheckCircle size={20} className="text-green-600"/>}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle size={20} className="text-red-500"/>}
                   </button>
                );
             })}
          </div>
       </div>

       <div className="h-20 flex items-center justify-end">
          {isAnswered && (
             <button onClick={handleNext} className="px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-black uppercase tracking-widest shadow-lg hover:translate-y-1 hover:shadow-none transition animate-in fade-in slide-in-from-bottom-2">
                {currentIndex + 1 === questions.length ? "Завершить" : "Дальше"}
             </button>
          )}
       </div>
    </div>
  );
};

export default QuizPlayer;