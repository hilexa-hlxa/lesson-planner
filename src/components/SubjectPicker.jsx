import { FlaskConical, Dna, Calculator as CalcIcon, Landmark, Globe2 } from 'lucide-react';
import { SUBJECTS, SUBJECT_LABELS } from '../data/subjectDecks';

// Общий выбор предмета для Memory Match и Sort It Out — один и тот же банк
// (src/data/subjectDecks.js), поэтому и выбор предмета один на двоих.
const SUBJECT_ICONS = { biology: Dna, chemistry: FlaskConical, math: CalcIcon, history: Landmark, geography: Globe2 };
const SUBJECT_COLORS = {
  biology: 'bg-lime-600', chemistry: 'bg-orange-500', math: 'bg-blue-600',
  history: 'bg-amber-700', geography: 'bg-teal-600',
};

export default function SubjectPicker({ lang = 'RU', onPick }) {
  const labels = SUBJECT_LABELS[lang] || SUBJECT_LABELS.RU;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {SUBJECTS.map((s) => {
        const Icon = SUBJECT_ICONS[s];
        return (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="group p-6 bg-white dark:bg-zinc-900 rounded-[28px] border-[4px] border-black dark:border-white shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col items-center gap-3 text-center"
          >
            <div className={`w-14 h-14 ${SUBJECT_COLORS[s]} text-white rounded-2xl flex items-center justify-center`}>
              <Icon size={28} />
            </div>
            <h3 className="text-base font-black uppercase">{labels[s]}</h3>
          </button>
        );
      })}
    </div>
  );
}
