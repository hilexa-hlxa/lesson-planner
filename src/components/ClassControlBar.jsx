import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, X, Trophy, Play, Square, GripVertical, FerrisWheel } from 'lucide-react';

// Укажи здесь базовый URL твоего API
// Если используешь Vite proxy, можно оставить просто '/api'
const API_URL = 'http://localhost:8000/api'; 

const ClassControlBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);
  
  // --- ЛОГИКА МОНЕТ ---
  const [coins, setCoins] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        
        // ВАЖНО: Мы должны отправлять credentials (куки), чтобы бэкенд узнал юзера
        const response = await fetch(`${API_URL}/coins`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // <--- ЭТО ОБЯЗАТЕЛЬНО ДЛЯ АВТОРИЗАЦИИ
        });
        
        if (response.ok) {
          const data = await response.json();
          // Backend returns { status: 'ok', data: { coins: 123 } } via Response::ok
          // Проверяем структуру твоего Response.php. Обычно это data.data.coins или data.coins
          // Судя по Response::ok(['coins' => $coins]), это будет data.data.coins
          const serverCoins = data.data ? data.data.coins : data.coins;
          
          if (serverCoins !== undefined) {
            setCoins(serverCoins);
            localStorage.setItem('l_coins', serverCoins);
          }
        }
      } catch (error) {
        console.error("API Error:", error);
        // Fallback to local storage
        const saved = Number(localStorage.getItem('l_coins'));
        if (saved) setCoins(saved);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  // Остальной код таймера и рендера без изменений...
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <>
      <motion.div drag dragMomentum={false} style={{ position: 'fixed', bottom: '80px', right: '40px', zIndex: 99999 }}>
        {!isExpanded ? (
          <motion.button layoutId="panel" onClick={() => setIsExpanded(true)} className="bg-black text-white p-6 rounded-3xl border-[5px] border-white shadow-2xl">
            <Book size={40} />
          </motion.button>
        ) : (
          <motion.div layoutId="panel" className="bg-white border-[4px] border-black p-5 rounded-[35px] shadow-[12px_12px_0_0_#000] flex items-center gap-6 text-black">
            <div className="opacity-30 cursor-grab scale-110"><GripVertical size={24} /></div>

            <button onClick={() => setIsPollOpen(true)} className="p-2.5 bg-yellow-400 border-[3px] border-black rounded-xl shadow-[3px_3px_0_0_#000] hover:-translate-y-1 transition-transform">
              <FerrisWheel size={24} />
            </button>

            <div className="flex items-center gap-3 border-x-[2px] border-black/10 px-4">
              <span className="font-mono font-black text-2xl italic min-w-[70px]">
                {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
              </span>
              <button onClick={() => setIsActive(!isActive)} className={`p-2 rounded-xl border-[2px] border-black ${isActive ? 'bg-red-400' : 'bg-green-400'}`}>
                {isActive ? <Square size={18} fill="black" /> : <Play size={18} fill="black" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Trophy size={24} className="text-orange-500" />
              <span className="font-black text-xl">
                {loading ? "..." : (coins ?? 120)}
              </span>
            </div>

            <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={22} /></button>
          </motion.div>
        )}
      </motion.div>

      {/* IFRAME КОЛЕСА */}
      <AnimatePresence>
        {isPollOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white border-[6px] border-black rounded-[40px] shadow-[20px_20px_0_0_#000] w-full max-w-6xl h-[90vh] relative overflow-hidden flex items-center justify-center"
            >
              <button onClick={() => setIsPollOpen(false)} className="absolute top-4 right-4 z-50 bg-black text-white p-2 rounded-full hover:bg-red-600 transition-colors border-2 border-white shadow-lg">
                <X size={24} />
              </button>
              
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                 <span className="font-bold text-gray-400 animate-pulse">Загрузка Wheel of Names...</span>
              </div>

              <iframe 
                src="https://wheelofnames.com/fdc19e3f-ea3b-457b-9bf1-6d4c79e88dc3"
                title="Wheel of Names"
                className="w-full h-full border-none relative z-10"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ClassControlBar;