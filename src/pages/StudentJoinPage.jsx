import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizPlayer from '../components/QuizPlayer';

const StudentJoinPage = () => {
  const [code, setCode] = useState('');
  const [name, setName] = useState(''); // Имя ученика
  const [quizData, setQuizData] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('login'); // 'login' | 'name' | 'playing' | 'done'
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (code.length !== 4) return;
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/quiz/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (res.status === 410) throw new Error('Срок действия кода истек (4 часа)');
      if (!res.ok) throw new Error('Тест не найден');
      
      const data = await res.json();
      const quiz = data.data || data.quiz || data;
      
      // Проверка: сдавал ли уже?
      const attemptKey = `quiz_attempt_${quiz.id}`;
      if (localStorage.getItem(attemptKey)) {
          throw new Error('Ты уже сдавал этот тест!');
      }

      setQuizData(quiz);
      setStep('name'); // Переходим к вводу имени
    } catch (e) {
      setError(e.message);
    }
  };

  const startQuiz = () => {
      if (!name.trim()) { setError('Введи имя!'); return; }
      setStep('playing');
  };

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[40px] p-8 border-[4px] border-white text-center shadow-2xl">
          <h1 className="text-4xl font-black mb-2 uppercase">Join Quiz</h1>
          <p className="text-gray-500 font-bold mb-8">Введи 4 цифры с доски</p>
          
          <input 
            type="text" maxLength={4} value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g,''))} 
            className="w-full text-center text-6xl font-black tracking-[1rem] border-b-[4px] border-black outline-none mb-8 placeholder-gray-200 uppercase"
            placeholder="0000"
          />
          {error && <p className="text-red-600 font-bold mb-4">{error}</p>}
          <button onClick={handleJoin} disabled={code.length !== 4} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 disabled:opacity-50 transition mb-4">
            ДАЛЕЕ
          </button>
          <button onClick={() => navigate('/hub')} className="text-gray-400 font-bold text-sm hover:text-black">← Назад</button>
        </div>
      </div>
    );
  }

  if (step === 'name') {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[40px] p-8 border-[4px] border-black text-center shadow-[10px_10px_0_0_#000]">
          <h2 className="text-2xl font-black mb-6 uppercase">Представься</h2>
          <input 
            type="text" value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 bg-gray-100 rounded-xl border-2 border-transparent focus:border-blue-600 font-bold outline-none mb-6 text-center text-xl"
            placeholder="Фамилия Имя"
          />
          <button onClick={startQuiz} className="w-full py-4 bg-black text-white rounded-2xl font-black text-xl hover:scale-105 transition">
            НАЧАТЬ ТЕСТ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
       <div className="bg-white p-4 border-b-2 border-black flex justify-between items-center">
          <span className="font-black truncate max-w-[200px]">{name}</span>
          <span className="bg-black text-white px-3 py-1 rounded font-mono">CODE: {code}</span>
       </div>
       <div className="flex-1 p-4">
          <QuizPlayer 
             markdownContent={quizData.result_md} 
             quizId={quizData.id}
             studentName={name}
             onClose={() => navigate('/hub')}
          />
       </div>
    </div>
  );
};

export default StudentJoinPage;