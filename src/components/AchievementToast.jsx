import React, { useEffect } from 'react';
import { Trophy, X } from 'lucide-react';

const VISIBLE_MS = 5000;

const AchievementToast = ({ achievement, onClose }) => {
  // Появление отдаём CSS-анимации, а не стейту: раньше видимость
  // выставлялась прямо в эффекте, что вызывало лишний каскад рендеров.
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(onClose, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-yellow-400 text-black p-4 rounded-2xl shadow-[6px_6px_0_0_#000] border-[3px] border-black flex items-center gap-4 max-w-sm">
        <div className="bg-white p-3 rounded-xl border-2 border-black">
           <Trophy size={24} className="text-yellow-500 fill-yellow-500 animate-bounce" />
        </div>

        <div className="flex-1">
           <h4 className="font-black uppercase text-[10px] tracking-widest opacity-60 leading-none">Achievement!</h4>
           <p className="font-black text-lg leading-tight mt-1">{achievement.title}</p>
           <p className="text-[10px] font-bold mt-1 uppercase">+ {achievement.reward || 100} Coins</p>
        </div>

        <button onClick={onClose} aria-label="Close" className="p-1 hover:bg-black/10 rounded-full transition">
           <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default AchievementToast;
