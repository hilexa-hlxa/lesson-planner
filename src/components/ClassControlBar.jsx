import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, X, Trophy, Play, Square, GripVertical, FerrisWheel, Mic, MicOff, Volume2, AlertTriangle } from 'lucide-react';
import FortuneWheel from './FortuneWheel'; // Импортируем твое новое колесо!
import api from '../api'; // Используем наш api wrapper для чистоты

const ClassControlBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);
  
  // --- COINS LOGIC ---
  const [coins, setCoins] = useState(null);
  const [loadingCoins, setLoadingCoins] = useState(true);

  const refreshCoins = async () => {
    try {
      const res = await api.request('/coins'); // Используем api.js (он сам подставит credentials)
      const val = res.data?.coins ?? res.coins;
      if (val !== undefined) setCoins(val);
    } catch (e) {
      console.error("Coin fetch error", e);
    } finally {
      setLoadingCoins(false);
    }
  };

  useEffect(() => { refreshCoins(); }, []);

  const handleWinCoin = async () => {
    try {
       // Добавляем 10 монет за победу в колесе
       await api.request('/coins/add', { method: 'POST', body: JSON.stringify({ amount: 10 }) });
       refreshCoins(); // Обновляем баланс
    } catch (e) { console.error(e); }
  };

  // --- TIMER LOGIC ---
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) interval = setInterval(() => setSeconds(s => s + 1), 1000);
    else clearInterval(interval);
    return () => clearInterval(interval);
  }, [isActive]);

  // --- NOISE METER LOGIC (Вернул!) ---
  const [isListening, setIsListening] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isTooLoud, setIsTooLoud] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const frameRef = useRef(null);

  const toggleMicrophone = async () => {
    if (isListening) stopListening();
    else await startListening();
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      setIsListening(true);
      detectVolume();
    } catch (err) {
      alert("Microphone access needed for Noise Meter");
    }
  };

  const stopListening = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    setIsListening(false);
    setNoiseLevel(0);
    setIsTooLoud(false);
  };

  const detectVolume = () => {
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const update = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      const average = sum / bufferLength;
      const normalized = Math.min(100, Math.round(average * 1.5));
      setNoiseLevel(normalized);
      setIsTooLoud(normalized > 75);
      if (isListening) frameRef.current = requestAnimationFrame(update);
    };
    update();
  };

  useEffect(() => { return () => stopListening(); }, []);

  return (
    <>
      <motion.div drag dragMomentum={false} style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 9999 }}>
        {!isExpanded ? (
          <motion.button layoutId="panel" onClick={() => setIsExpanded(true)} className="bg-black text-white p-5 rounded-3xl border-[4px] border-white shadow-xl hover:scale-110 transition">
            <Book size={32} />
          </motion.button>
        ) : (
          <motion.div layoutId="panel" className="bg-white border-[4px] border-black p-4 rounded-[30px] shadow-[10px_10px_0_0_#000] flex items-center gap-4 text-black">
            <div className="opacity-30 cursor-grab active:cursor-grabbing"><GripVertical size={20} /></div>

            {/* Wheel Button */}
            <button onClick={() => setIsPollOpen(true)} className="p-2.5 bg-yellow-400 border-2 border-black rounded-xl hover:-translate-y-1 transition shadow-[2px_2px_0_0_#000]">
              <FerrisWheel size={20} />
            </button>

            {/* Noise Meter */}
            <button onClick={toggleMicrophone} className={`p-2.5 border-2 border-black rounded-xl hover:-translate-y-1 transition shadow-[2px_2px_0_0_#000] ${isTooLoud ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100'}`}>
                {isListening ? (isTooLoud ? <AlertTriangle size={20}/> : <Volume2 size={20}/>) : <MicOff size={20}/>}
            </button>

            {/* Timer */}
            <div className="flex items-center gap-2 border-l-2 border-r-2 border-gray-100 px-3">
              <span className="font-mono font-black text-xl italic min-w-[50px]">
                {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
              </span>
              <button onClick={() => setIsActive(!isActive)} className={`p-1.5 rounded-lg border-2 border-black ${isActive ? 'bg-red-400' : 'bg-green-400'}`}>
                {isActive ? <Square size={14} fill="black" /> : <Play size={14} fill="black" />}
              </button>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-2 pr-2">
              <Trophy size={20} className="text-orange-500 fill-orange-500" />
              <span className="font-black text-lg">
                {loadingCoins ? "..." : (coins ?? 0)}
              </span>
            </div>

            <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
          </motion.div>
        )}
      </motion.div>

      {/* RENDER NEW WHEEL COMPONENT */}
      <AnimatePresence>
        {isPollOpen && (
          <FortuneWheel 
            onClose={() => setIsPollOpen(false)} 
            onWin={handleWinCoin} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ClassControlBar;