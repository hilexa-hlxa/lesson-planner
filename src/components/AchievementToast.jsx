import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';

const AchievementToast = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      
      // Добавим звук (по желанию, можно убрать)
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
      audio.volume = 0.2; // Сделаем потише

      // Играем только один раз
      audio.play().catch(() => {});

      const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

      return () => clearTimeout(timer);
      audio.pause();
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[999] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="bg-yellow-400 text-black p-4 rounded-2xl shadow-[6px_6px_0_0_#000] border-[3px] border-black flex items-center gap-4 max-w-sm">
        <div className="bg-white p-3 rounded-xl border-2 border-black">
           <Trophy size={24} className="text-yellow-500 fill-yellow-500 animate-bounce" />
        </div>
        
        <div className="flex-1">
           <h4 className="font-black uppercase text-[10px] tracking-widest opacity-60 leading-none">Achievement!</h4>
           <p className="font-black text-lg leading-tight mt-1">{achievement.title}</p>
           <p className="text-[10px] font-bold mt-1 uppercase">+ {achievement.reward || 100} Coins</p>
        </div>

        <button onClick={() => setVisible(false)} className="p-1 hover:bg-black/10 rounded-full transition">
           <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default AchievementToast;