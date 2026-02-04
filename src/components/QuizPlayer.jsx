import React, { useState, useEffect } from 'react';
import { parseMarkdownQuiz } from '../lib/quizParser';
import { CheckCircle, XCircle, ArrowRight, AlertTriangle } from 'lucide-react';

const QuizPlayer = ({ markdownContent, onClose, quizId, studentName }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [details, setDetails] = useState([]); 

  useEffect(() => {
    if (markdownContent) {
      try {
          const parsed = parseMarkdownQuiz(markdownContent);
          
          if (!parsed || parsed.length === 0) {
              console.error("Парсер вернул пустой массив вопросов!");
              return;
          }

          // === БЕЗОПАСНОЕ ПЕРЕМЕШИВАНИЕ ===
          const shuffledQuestions = parsed.map(q => {
              // Если опций нет или это не массив — возвращаем вопрос как есть (чтобы не сломать)
              if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
                  console.warn("В вопросе нет вариантов ответов:", q.question);
                  return q; 
              }

              try {
                  const originalOptions = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correctIndex }));
                  // Алгоритм Фишера-Йетса
                  for (let i = originalOptions.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [originalOptions[i], originalOptions[j]] = [originalOptions[j], originalOptions[i]];
                  }
                  
                  const newCorrectIndex = originalOptions.findIndex(o => o.isCorrect);
                  
                  return {
                      ...q,
                      options: originalOptions.map(o => o.text),
                      correctIndex: newCorrectIndex
                  };
              } catch (err) {
                  console.error("Ошибка при перемешивании вопроса:", err);
                  return q; // Если ошибка — возвращаем оригинал
              }
          });

          setQuestions(shuffledQuestions);
          const now = Date.now();
          setStartTime(now);
          setQuestionStartTime(now);

      } catch (e) {
          console.error("Критическая ошибка при разборе теста:", e);
      }
    }
  }, [markdownContent]);

  const handleOptionClick = (index) => {
    if (isAnswered) return; 

    const now = Date.now();
    const timeSpent = Math.round((now - questionStartTime) / 1000);

    setSelectedOption(index);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    // Защита: если индекс выходит за пределы (редкий баг)
    if (!currentQ || !currentQ.options) return;

    const isCorrect = index === currentQ.correctIndex;

    const newDetail = {
        question: currentQ.question,
        selected: currentQ.options[index] || "Ошибка",
        isCorrect: isCorrect,
        time: timeSpent || 1
    };
    
    setDetails(prev => [...prev, newDetail]);
    
    if (isCorrect) {
      setScore(s => s + 1);
      new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3').play().catch(()=>{});
    } else {
      new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3').play().catch(()=>{});
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setShowResult(true);
    const endTime = Date.now();
    const durationSeconds = Math.round((endTime - startTime) / 1000);

    if (quizId) {
        localStorage.setItem(`quiz_attempt_${quizId}`, 'true');
        try {
            await fetch('http://localhost:8000/api/quiz/submit', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    quiz_id: quizId,
                    student_name: studentName,
                    score: score,
                    total: questions.length,
                    duration: durationSeconds,
                    details: details 
                })
            });
        } catch (e) { console.error(e); }
    }
    
    const reward = score * 10;
    if (reward > 0) {
        fetch('http://localhost:8000/api/coins/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ amount: reward }),
            credentials: 'include'
        }).catch(()=>{});
    }
  };

  if (questions.length === 0) return <div className="p-10 text-center font-bold animate-pulse">Загрузка вопросов...</div>;

  // РЕЗУЛЬТАТ
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in zoom-in">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-[6px] border-black text-white text-4xl font-black mb-6 ${percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`}>
           {percentage}%
        </div>
        <h2 className="text-4xl font-black mb-2 uppercase">ТЕСТ ЗАВЕРШЕН</h2>
        <p className="text-xl font-bold text-gray-500 mb-8">Результаты отправлены учителю</p>
        <button onClick={onClose} className="px-8 py-4 bg-black text-white rounded-xl font-bold">В МЕНЮ</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  // ЗАЩИТА ОТ ПУСТОГО ВОПРОСА
  if (!currentQ) return <div className="p-10 text-center text-red-500 font-bold">Ошибка: Вопрос не найден</div>;

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col justify-center p-6">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
      </div>
      
      <h2 className="text-3xl font-black mb-8 leading-tight">{currentIndex + 1}. {currentQ.question}</h2>

      {/* ЕСЛИ ОПЦИЙ НЕТ — ПОКАЗЫВАЕМ ПРЕДУПРЕЖДЕНИЕ */}
      {(!currentQ.options || currentQ.options.length === 0) ? (
          <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-4 text-red-600 font-bold">
              <AlertTriangle size={32} />
              <div>
                  <p>У этого вопроса нет вариантов ответа.</p>
                  <p className="text-xs opacity-70">Возможно, ошибка генерации AI. Нажмите "Далее", чтобы пропустить.</p>
              </div>
          </div>
      ) : (
          <div className="space-y-4">
            {currentQ.options.map((option, idx) => {
              let btnClass = "w-full p-6 text-left text-lg font-bold border-[3px] rounded-2xl transition-all transform ";
              if (!isAnswered) {
                 btnClass += "bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer hover:translate-x-2";
              } else {
                 if (idx === currentQ.correctIndex) btnClass += "bg-green-100 border-green-500 text-green-800";
                 else if (idx === selectedOption) btnClass += "bg-red-100 border-red-500 text-red-800";
                 else btnClass += "bg-gray-50 border-gray-100 opacity-50";
              }
              return (
                <button key={idx} disabled={isAnswered} onClick={() => handleOptionClick(idx)} className={btnClass}>
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isAnswered && idx === currentQ.correctIndex && <CheckCircle className="text-green-600" />}
                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle className="text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>
      )}

      {/* КНОПКА ДАЛЕЕ (Появляется если ответили ИЛИ если нет вариантов ответа) */}
      {(isAnswered || !currentQ.options || currentQ.options.length === 0) && (
        <div className="mt-8 flex justify-end">
            <button onClick={nextQuestion} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition animate-bounce">
                Далее <ArrowRight size={20}/>
            </button>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;