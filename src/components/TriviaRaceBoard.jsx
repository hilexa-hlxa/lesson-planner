import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';

const LANE_COLORS = ['bg-amber-500', 'bg-sky-500', 'bg-fuchsia-500', 'bg-lime-500', 'bg-orange-500', 'bg-cyan-500'];

// Общая визуализация поля для Trivia Race — и учитель (только смотрит), и
// ученик (смотрит + играет) рендерят одну и ту же дорожку по опросу
// /api/trivia-race/state, поэтому картинка гарантированно совпадает у всех.
export default function TriviaRaceBoard({ boardLength, players, currentPlayerId }) {
  return (
    <div className="w-full flex flex-col gap-3">
      {players.map((p, i) => {
        const pct = Math.min(100, (p.position / boardLength) * 100);
        const isMe = p.id === currentPlayerId;
        return (
          <div key={p.id} className="flex items-center gap-3">
            <span className={`w-24 sm:w-32 truncate text-xs sm:text-sm font-black uppercase ${isMe ? 'text-black dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              {p.name}{isMe ? ' •' : ''}
            </span>
            <div className="relative flex-1 h-8 bg-slate-100 dark:bg-zinc-800 rounded-full border-2 border-black dark:border-white overflow-hidden">
              <motion.div
                className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black text-white ${LANE_COLORS[i % LANE_COLORS.length]}`}
                animate={{ left: `calc(${pct}% - ${pct > 0 ? '12px' : '0px'})` }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                {p.finished ? <Flag size={12} /> : ''}
              </motion.div>
            </div>
            <span className="w-10 text-right text-xs font-black text-slate-500 dark:text-slate-400">{p.position}/{boardLength}</span>
          </div>
        );
      })}
    </div>
  );
}
