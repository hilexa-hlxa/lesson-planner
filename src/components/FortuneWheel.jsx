import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';

const SEGMENT_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', 
  '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'
];

const FortuneWheel = ({ initialNames, onClose, onWin }) => {
  const [textInput, setTextInput] = useState(initialNames || "Ali\nMaria\nDamir\nAlina\nTimur\nSanzhar");
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const segments = textInput.split('\n').filter(name => name.trim() !== "");

  const spin = () => {
    if (segments.length < 2) {
        alert("Need at least 2 names!");
        return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const sliceAngle = 360 / segments.length;
    const spins = 1800; // 5 full spins
    const randomOffset = Math.floor(Math.random() * 360);
    
    let targetRotation = rotation + spins + randomOffset;

    // Center the winning segment at the top (Pointer)
    const currentMod = targetRotation % 360;
    const remainder = currentMod % sliceAngle;
    const correction = (sliceAngle / 2) - remainder;
    const finalRotation = targetRotation + correction;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      
      const normalizedAngle = finalRotation % 360;
      // Index calc (Counter-clockwise from top)
      const winningIndex = Math.floor(((360 - normalizedAngle + (sliceAngle / 2)) % 360) / sliceAngle);
      
      const winName = segments[winningIndex];
      setWinner(winName);
      if (onWin) onWin(winName); 
    }, 5000);
  };

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100000] flex items-center justify-center p-4 font-sans animate-in fade-in">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white border-[6px] border-black rounded-[40px] shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={32} className="text-black" />
        </button>

        {/* LEFT PANEL: Input */}
        <div className="w-1/3 bg-gray-50 border-r-[4px] border-black p-8 flex flex-col hidden md:flex">
          <h2 className="text-4xl font-black uppercase italic mb-6">Participants</h2>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isSpinning}
            className="flex-1 w-full border-[4px] border-black rounded-2xl p-4 text-xl font-bold resize-none focus:outline-none focus:ring-4 ring-yellow-400 mb-4 bg-white"
            placeholder="Names here..."
          />
          <div className="text-right font-bold text-gray-400 uppercase tracking-widest text-xs">
            {segments.length} Players
          </div>
        </div>

        {/* RIGHT PANEL: Wheel */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-white p-4">
          
          {/* POINTER (12 o'clock) */}
          <div className="absolute top-[5%] z-20">
            <div className="w-16 h-14 bg-red-600 border-[4px] border-black shadow-lg" 
                 style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
            </div>
          </div>

          {/* WHEEL CONTAINER */}
          <div className="relative w-full max-w-[600px] aspect-square">
            <motion.div
              className="w-full h-full"
              animate={{ rotate: rotation }}
              transition={{ duration: 5, ease: [0.2, 0.8, 0.2, 1] }} 
            >
              <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full drop-shadow-2xl">
                {segments.map((name, i) => {
                  const startAngle = i / segments.length;
                  const endAngle = (i + 1) / segments.length;
                  const [startX, startY] = getCoordinatesForPercent(startAngle);
                  const [endX, endY] = getCoordinatesForPercent(endAngle);
                  const largeArcFlag = endAngle - startAngle > 0.5 ? 1 : 0;
                  const fontSize = Math.min(0.12, 0.5 / segments.length + 0.05, 1.5 / name.length); 

                  return (
                    <g key={i}>
                      <path
                        d={`M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                        fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                        stroke="black"
                        strokeWidth="0.01"
                      />
                      <text
                        x="0.6" 
                        y="0"
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={fontSize}
                        fontWeight="900"
                        fontFamily="Arial"
                        transform={`rotate(${(i * 360) / segments.length + 360 / segments.length / 2} 0 0)`}
                        style={{ textShadow: '0.005px 0.005px 0 black' }}
                      >
                        {name.length > 15 ? name.slice(0, 14) + '..' : name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </motion.div>
          </div>

          <button
            onClick={spin}
            disabled={isSpinning}
            className="absolute bottom-10 px-16 py-6 bg-emerald-600 text-white font-black text-3xl uppercase rounded-full border-[5px] border-black shadow-[8px_8px_0_0_#000] hover:-translate-y-1 active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? "..." : "SPIN!"}
          </button>

          {/* WINNER POPUP */}
          <AnimatePresence>
            {winner && (
              <motion.div 
                initial={{ scale: 0, rotate: -10 }} 
                animate={{ scale: 1, rotate: 0 }} 
                exit={{ scale: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                onClick={() => setWinner(null)}
              >
                <div className="bg-white border-[8px] border-black p-12 rounded-[40px] text-center shadow-[30px_30px_0_0_#000] rotate-[-2deg]">
                  <div className="text-2xl font-black text-gray-400 uppercase mb-2">Winner</div>
                  <div className="text-7xl font-black uppercase text-emerald-600 tracking-tighter mb-4">{winner}</div>
                  
                  {onWin && (
                      <div className="flex items-center justify-center gap-2 font-black text-green-600 bg-green-100 px-6 py-3 rounded-2xl border-2 border-green-500">
                          <Trophy size={24} /> +10 Coins Sent!
                      </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};

export default FortuneWheel;