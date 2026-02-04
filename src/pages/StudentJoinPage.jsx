import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Hash, User } from 'lucide-react';
import api from '../api';

const StudentJoinPage = () => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code || !name) return;

    setLoading(true);
    try {
      // Validate session code
      const res = await fetch('http://localhost:8000/api/quiz/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Session not found');
        return;
      }

      // Cache student session data
      localStorage.setItem('student_quiz_session', JSON.stringify({
        quiz: data.data?.quiz || data.quiz,
        studentName: name.trim(),
        startTime: Date.now()
      }));

      // Redirect to game interface
      navigate('/play');

    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-[8px_8px_0_0_#000] border-[4px] border-black dark:border-gray-700">
        <h1 className="text-3xl font-black uppercase text-center mb-2">Join Quiz</h1>
        <p className="text-center text-gray-500 font-bold text-xs uppercase tracking-widest mb-8">
          Enter code & name to start
        </p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1">Access Code</label>
            <div className="relative">
              <Hash className="absolute left-4 top-4 text-gray-400" size={20} />
              <input 
                type="text" 
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="0000" 
                className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-black text-2xl tracking-[0.2em] outline-none focus:ring-4 ring-blue-500/20 transition text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1">Your Name</label>
            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-400" size={20} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold text-lg outline-none focus:ring-4 ring-blue-500/20 transition"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || code.length !== 4 || !name}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Start Quiz'} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentJoinPage;