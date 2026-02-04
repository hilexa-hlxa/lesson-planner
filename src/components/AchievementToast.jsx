import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';

const AchievementToast = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="bg-yellow-400 text-black p-4 rounded-2xl shadow-[6px_6px_0_0_#000] border-[3px] border-black flex items-center gap-4 max-w-sm">
        <div className="bg-white p-3 rounded-xl border-2 border-black">
           <Trophy size={24} className="text-yellow-500 fill-yellow-500 animate-bounce" />
        </div>
        
        <div className="flex-1">
           <h4 className="font-black uppercase text-xs tracking-widest opacity-60">Achievement Unlocked!</h4>
           <p className="font-black text-lg leading-none mt-1">{achievement.title || "First Steps"}</p>
           <p className="text-xs font-bold mt-1">+ {achievement.reward || 100} Coins</p>
        </div>

        <button onClick={() => setVisible(false)} className="p-1 hover:bg-black/10 rounded-full transition">
           <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default AchievementToast;