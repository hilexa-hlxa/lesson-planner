import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';

const AchievementToast = ({ show, onClose, title, reward, description }) => {
  // Авто-закрытие через 5 секунд
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-24 right-5 z-[100000] w-80 bg-white border-[4px] border-black rounded-[20px] shadow-[8px_8px_0_0_#000] overflow-hidden"
        >
          {/* Желтая шапка */}
          <div className="bg-yellow-400 p-3 border-b-[3px] border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="text-black fill-white" size={20} />
              <span className="font-black uppercase italic tracking-tighter text-sm">Achievement!</span>
            </div>
            <button onClick={onClose} className="hover:bg-black/10 rounded-full p-1 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Контент */}
          <div className="p-4 flex flex-col gap-2">
            <h3 className="font-black text-xl leading-none">{title}</h3>
            
            <div className="self-start bg-green-100 text-green-700 font-black px-3 py-1 rounded-lg border-2 border-green-700 text-sm transform -rotate-2">
               +{reward} Coins
            </div>
            
            <p className="text-gray-500 font-bold text-xs leading-tight">
              {description}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementToast;