import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, CheckCircle, XCircle, Trophy } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { parseMarkdownQuiz } from '../lib/quizParser';

const API_URL = 'http://localhost:8000/api';

const QuizPlayer = () => {
  const navigate = useNavigate();
  
  // Game State
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // Detailed tracking for analytics
  const [answersLog, setAnswersLog] = useState([]); 

  // Timer State
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const timerRef = useRef(null);

  // --- Initialization ---
  useEffect(() => {
    const raw = localStorage.getItem('student_quiz_session');
    if (!raw) {
      navigate('/join');
      return;
    }
    const data = JSON.parse(raw);
    setSession(data);

    // Parse questions from Markdown
    const parsed = parseMarkdownQuiz(data.quiz.result_md);
    setQuestions(parsed);
  }, [navigate]);

  // --- Timer Logic ---
  useEffect(() => {
    if (quizFinished) return;
    
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setQuestionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quizFinished]);

  // --- Handlers ---
  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Log detail for AI report
    setAnswersLog(prev => [
        ...prev, 
        {
            questionId: currentIndex,
            isCorrect,
            time: questionTime,
            selected: optionIndex
        }
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setQuestionTime(0); // Reset question timer
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    clearInterval(timerRef.current);

    // Final calculation including the last answer
    // Note: 'score' state might be stale in this closure if updated immediately before, 
    // but React handles batching. For safety, we trust the current state flow or use refs.
    
    // Submit to server
    try {
        await fetch(`${API_URL}/quiz/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_id: session.quiz.id,
                student_name: session.studentName,
                score: score + (questions[currentIndex].correctIndex === selectedOption ? 1 : 0), // Add last point if correct
                total: questions.length,
                duration: elapsedTime,
                details: answersLog
            })
        });
    } catch (e) {
        console.error("Submission failed", e);
    }
  };

  const handleExit = () => {
    localStorage.removeItem('student_quiz_session');
    navigate('/join');
  };

  if (!session || questions.length === 0) return <div className="p-10 text-center font-bold">Loading...</div>;

  // --- Results Screen ---
  if (quizFinished) {
    const finalScore = score + (questions[currentIndex].correctIndex === selectedOption ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);

    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center p-6 text-center font-sans">
        <ReactConfetti recycle={false} numberOfPieces={500} />
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-10 rounded-[40px] shadow-2xl border-[4px] border-black dark:border-white animate-in zoom-in">
           <div className="mb-6 flex justify-center">
               <Trophy size={64} className="text-yellow-400 fill-yellow-400 animate-bounce" />
           </div>
           <h1 className="text-4xl font-black uppercase mb-2">Quiz Finished!</h1>
           <p className="text-gray-500 font-bold uppercase tracking-widest mb-8">{session.studentName}</p>
           
           <div className="bg-slate-100 dark:bg-zinc-800 p-6 rounded-2xl mb-8">
              <div className="text-6xl font-black text-blue-600 mb-2">{percentage}%</div>
              <p className="font-bold text-sm text-gray-400 uppercase">Correct: {finalScore} / {questions.length}</p>
              <p className="font-bold text-sm text-gray-400 uppercase mt-1">Time: {elapsedTime}s</p>
           </div>

           <button onClick={handleExit} className="w-full py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 transition">
              Back to Menu
           </button>
        </div>
      </div>
    );
  }

  // --- Game Screen ---
  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-6 md:p-10 font-sans flex flex-col max-w-3xl mx-auto">
       
       {/* Header */}
       <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-zinc-700">
             <Timer size={18} className="text-blue-500" />
             <span className="font-black font-mono text-lg">{elapsedTime}s</span>
          </div>
          <div className="font-black text-gray-400 text-xs uppercase tracking-widest">
             Question {currentIndex + 1} of {questions.length}
          </div>
       </div>

       {/* Progress Bar */}
       <div className="w-full h-3 bg-gray-200 dark:bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
       </div>

       {/* Question Card */}
       <div className="bg-white dark:bg-zinc-900 p-6 md:p-10 rounded-[30px] border-[3px] border-black dark:border-gray-600 shadow-[6px_6px_0_0_#000] mb-6 flex-1">
          <h2 className="text-2xl font-black mb-8 leading-tight">{currentQ.question}</h2>

          <div className="space-y-3">
             {currentQ.options.map((opt, idx) => {
                let stateClass = "border-gray-200 dark:border-zinc-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800";
                
                if (isAnswered) {
                    if (idx === currentQ.correctIndex) stateClass = "bg-green-100 border-green-500 text-green-700";
                    else if (idx === selectedOption) stateClass = "bg-red-100 border-red-500 text-red-700";
                    else stateClass = "opacity-50 border-gray-100";
                }

                return (
                   <button
                     key={idx}
                     onClick={() => handleAnswer(idx)}
                     disabled={isAnswered}
                     className={`w-full text-left p-5 rounded-xl border-2 font-bold transition-all duration-200 flex justify-between items-center ${stateClass}`}
                   >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && <CheckCircle size={20} className="text-green-600"/>}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle size={20} className="text-red-500"/>}
                   </button>
                );
             })}
          </div>
       </div>

       {/* Next Button */}
       <div className="h-20 flex items-center justify-end">
          {isAnswered && (
             <button onClick={handleNext} className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:translate-y-1 hover:shadow-none transition animate-in fade-in slide-in-from-bottom-2">
                {currentIndex + 1 === questions.length ? "Finish Quiz" : "Next Question"}
             </button>
          )}
       </div>

    </div>
  );
};

export default QuizPlayer;