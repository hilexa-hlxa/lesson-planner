import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Цвета как на piliapp (яркие и различимые)
const SEGMENT_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#4CD964', // Green
  '#5AC8FA', // Teal
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#FF2D55', // Pink
];

const FortuneWheel = ({ initialNames, onClose, onWin }) => {
  const [textInput, setTextInput] = useState(initialNames || "Азамат\nМария\nДамир\nАлина\nТимур");
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // Обрабатываем список имен
  const segments = textInput.split('\n').filter(name => name.trim() !== "");

  const spin = () => {
    if (segments.length < 2) return alert("Минимум 2 имени!");
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const sliceAngle = 360 / segments.length;
    // Минимум 5 полных оборотов (1800 градусов) + случайный сектор
    const spins = 1800; 
    const randomOffset = Math.floor(Math.random() * 360);
    
    // Целевое вращение без доводки
    let targetRotation = rotation + spins + randomOffset;

    // --- LOCK-IN LOGIC (Центровка) ---
    // Вычисляем, чтобы стрелка указывала ровно в центр сектора
    const currentMod = targetRotation % 360;
    const remainder = currentMod % sliceAngle;
    // Сдвигаем так, чтобы остаток был равен половине сектора
    const correction = (sliceAngle / 2) - remainder;
    const finalRotation = targetRotation + correction;

    setRotation(finalRotation);

    // Время вращения - 5 секунд (как на piliapp)
    setTimeout(() => {
      setIsSpinning(false);
      
      // Вычисляем победителя
      const normalizedAngle = finalRotation % 360;
      // Индекс считается против часовой стрелки от верха (12 часов)
      const winningIndex = Math.floor(((360 - normalizedAngle + (sliceAngle / 2)) % 360) / sliceAngle);
      
      const winName = segments[winningIndex];
      setWinner(winName);
      if (onWin) onWin(); // Начисляем монетки
    }, 5000);
  };

  // Функция для рисования сектора SVG
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white border-[6px] border-black rounded-[40px] shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 hover:bg-red-100 rounded-full transition-colors">
          <X size={32} className="text-black" />
        </button>

        {/* ЛЕВАЯ ПАНЕЛЬ: Ввод имен */}
        <div className="w-1/3 bg-gray-50 border-r-[4px] border-black p-8 flex flex-col hidden md:flex">
          <h2 className="text-4xl font-black uppercase italic mb-6">Список</h2>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isSpinning}
            className="flex-1 w-full border-[4px] border-black rounded-2xl p-4 text-xl font-bold resize-none focus:outline-none focus:ring-4 ring-yellow-400 mb-4"
            placeholder="Имена с новой строки..."
          />
          <div className="text-right font-bold text-gray-400">
            {segments.length} участников
          </div>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ: Колесо */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-white p-4">
          
          {/* СТРЕЛКА (12 ЧАСОВ) */}
          <div className="absolute top-[5%] z-20">
            <div className="w-16 h-14 bg-red-600 border-[4px] border-black shadow-lg" 
                 style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
            </div>
          </div>

          {/* КОНТЕЙНЕР КОЛЕСА */}
          <div className="relative w-full max-w-[600px] aspect-square">
            <motion.div
              className="w-full h-full"
              animate={{ rotate: rotation }}
              transition={{ duration: 5, ease: [0.2, 0.8, 0.2, 1] }} // Плавная физика piliapp
            >
              <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full drop-shadow-2xl">
                {segments.map((name, i) => {
                  const startAngle = i / segments.length;
                  const endAngle = (i + 1) / segments.length;
                  const [startX, startY] = getCoordinatesForPercent(startAngle);
                  const [endX, endY] = getCoordinatesForPercent(endAngle);
                  const largeArcFlag = endAngle - startAngle > 0.5 ? 1 : 0;

                  // Параметры текста
                  // Если имя длинное, уменьшаем шрифт
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
                        x="0.6" // Позиция от центра (радиус 1)
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

          {/* КНОПКА SPIN */}
          <button
            onClick={spin}
            disabled={isSpinning}
            className="absolute bottom-10 px-16 py-6 bg-blue-600 text-white font-black text-3xl uppercase rounded-full border-[5px] border-black shadow-[8px_8px_0_0_#000] hover:-translate-y-1 active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? "..." : "КРУТИТЬ!"}
          </button>

          {/* ПОБЕДИТЕЛЬ POPUP */}
          <AnimatePresence>
            {winner && (
              <motion.div 
                initial={{ scale: 0, rotate: -10 }} 
                animate={{ scale: 1, rotate: 0 }} 
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                onClick={() => setWinner(null)}
              >
                <div className="bg-white border-[8px] border-black p-12 rounded-[40px] text-center shadow-[30px_30px_0_0_#000] rotate-[-2deg]">
                  <div className="text-2xl font-black text-gray-400 uppercase mb-2">Winner</div>
                  <div className="text-7xl font-black uppercase text-blue-600 tracking-tighter">{winner}</div>
                  <div className="mt-4 font-bold text-green-500 bg-green-100 px-4 py-1 rounded-full inline-block">+10 Coins!</div>
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