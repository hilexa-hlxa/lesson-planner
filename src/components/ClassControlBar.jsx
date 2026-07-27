import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Play, Square, RotateCcw } from 'lucide-react';

const ClassControlBar = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) interval = setInterval(() => setSeconds(s => s + 1), 1000);
    else clearInterval(interval);
    return () => clearInterval(interval);
  }, [isActive]);

  const reset = () => { setIsActive(false); setSeconds(0); };

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <motion.div
      drag dragMomentum={false}
      style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 9999 }}
    >
      <motion.div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white px-4 py-3 rounded-2xl shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.15)]">
        <Timer size={18} className="text-emerald-600 shrink-0" />
        <span className="font-mono font-black text-xl tracking-wider min-w-[52px] dark:text-white">
          {mins}:{secs}
        </span>
        <button
          onClick={() => setIsActive(v => !v)}
          className={`p-1.5 rounded-lg border-2 border-black dark:border-white transition ${isActive ? 'bg-red-400' : 'bg-green-400'}`}
        >
          {isActive ? <Square size={14} fill="black" /> : <Play size={14} fill="black" />}
        </button>
        <button
          onClick={reset}
          className="p-1.5 rounded-lg border-2 border-black dark:border-white bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 transition"
        >
          <RotateCcw size={14} className="dark:text-white" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ClassControlBar;
