import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shuffle, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';

const T = {
  RU: {
    title: 'РАССАДКА КЛАССА',
    pickClass: 'Выбери класс', noClasses: 'У тебя пока нет ни одного класса.',
    noStudents: 'В этом классе пока нет учеников.',
    rows: 'Рядов', cols: 'Мест в ряду',
    keepApart: 'Рассадить отдельно (по одной паре на строку)',
    keepApartPh: 'Например:\nАли, Мария\nДамир, Тимур',
    generate: 'Сгенерировать', regenerate: 'Пересоздать',
    violations: 'Не удалось развести всех — эти пары всё равно рядом:',
    empty: 'пусто',
  },
  KZ: {
    title: 'СЫНЫПТЫ ОТЫРҒЫЗУ',
    pickClass: 'Сыныпты таңда', noClasses: 'Сенде әзірге бір де сынып жоқ.',
    noStudents: 'Бұл сыныпта әзірге оқушы жоқ.',
    rows: 'Қатарлар', cols: 'Қатардағы орындар',
    keepApart: 'Бөлек отырғызу (әр жолда бір жұп)',
    keepApartPh: 'Мысалы:\nӘли, Мария\nДамир, Тимур',
    generate: 'Жасау', regenerate: 'Қайта жасау',
    violations: 'Барлығын бөлек отырғызу мүмкін болмады — бұл жұптар әлі де қатар:',
    empty: 'бос',
  },
  EN: {
    title: 'SEATING CHART',
    pickClass: 'Pick a class', noClasses: "You don't have any classes yet.",
    noStudents: 'This class has no students yet.',
    rows: 'Rows', cols: 'Seats per row',
    keepApart: 'Keep apart (one pair per line)',
    keepApartPh: 'e.g.:\nAli, Maria\nDamir, Timur',
    generate: 'Generate', regenerate: 'Regenerate',
    violations: "Couldn't separate everyone — these pairs are still adjacent:",
    empty: 'empty',
  },
};

function nameOf(m) {
  return m.display_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || m.email;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parsePairs(text, names) {
  const lower = names.map((n) => n.toLowerCase());
  return text.split('\n').map((line) => line.split(',').map((s) => s.trim()).filter(Boolean))
    .filter((pair) => pair.length === 2)
    .map(([a, b]) => [lower.indexOf(a.toLowerCase()), lower.indexOf(b.toLowerCase())])
    .filter(([a, b]) => a !== -1 && b !== -1 && a !== b);
}

function countViolations(grid, cols, pairs) {
  // соседи — по горизонтали и вертикали, не по диагонали
  const posOf = new Map();
  grid.forEach((idx, pos) => { if (idx !== null) posOf.set(idx, pos); });
  let violations = 0;
  const violatingPairs = [];
  pairs.forEach(([a, b]) => {
    if (!posOf.has(a) || !posOf.has(b)) return;
    const pa = posOf.get(a), pb = posOf.get(b);
    const ra = Math.floor(pa / cols), ca = pa % cols;
    const rb = Math.floor(pb / cols), cb = pb % cols;
    const adjacent = (ra === rb && Math.abs(ca - cb) === 1) || (ca === cb && Math.abs(ra - rb) === 1);
    if (adjacent) { violations++; violatingPairs.push([a, b]); }
  });
  return { violations, violatingPairs };
}

function generateLayout(names, rows, cols, pairs) {
  const seats = rows * cols;
  const indices = names.map((_, i) => i);
  const seatPositions = Array.from({ length: seats }, (_, i) => i);
  let best = null;
  let bestScore = Infinity;
  for (let attempt = 0; attempt < 300; attempt++) {
    // Тасуем и студентов, и сами места — иначе при students < seats они
    // всегда осядут в первых N ячейках подряд, и их никогда не развести.
    const shuffledStudents = shuffleArray(indices);
    const shuffledSeats = shuffleArray(seatPositions).slice(0, shuffledStudents.length);
    const grid = Array(seats).fill(null);
    shuffledSeats.forEach((pos, i) => { grid[pos] = shuffledStudents[i]; });
    const { violations, violatingPairs } = countViolations(grid, cols, pairs);
    if (violations < bestScore) {
      best = { grid, violatingPairs };
      bestScore = violations;
      if (violations === 0) break;
    }
  }
  return best;
}

export default function SeatingChartPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [cls, setCls] = useState(null);
  const [members, setMembers] = useState([]);
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(5);
  const [keepApart, setKeepApart] = useState('');
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    api.classes.list().then((r) => setClasses(r.items || r.classes || [])).catch(() => {});
  }, []);

  const pickClass = async (c) => {
    setCls(c); setLayout(null);
    try {
      const r = await api.classes.getMembers(c.id, 'approved');
      setMembers(r.members || r.items || []);
    } catch {
      setMembers([]);
    }
  };

  const names = members.map(nameOf);

  const doGenerate = () => {
    if (names.length === 0) return;
    const pairs = parsePairs(keepApart, names);
    setLayout(generateLayout(names, rows, cols, pairs));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-4xl mx-auto px-5 sm:px-6">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000] mb-8">
          <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.pickClass}</label>
          {classes.length === 0 && <p className="text-slate-400 font-bold text-sm mb-3">{t.noClasses}</p>}
          <div className="flex flex-wrap gap-2 mb-5">
            {classes.map((c) => (
              <button key={c.id} onClick={() => pickClass(c)}
                className={`px-4 py-2 rounded-xl border-[3px] font-bold text-sm transition-colors ${cls?.id === c.id ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                {c.name}
              </button>
            ))}
          </div>

          {cls && members.length === 0 && <p className="text-slate-400 font-bold text-sm">{t.noStudents}</p>}

          {cls && members.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.rows}</label>
                  <input type="number" min={1} max={10} value={rows} onChange={(e) => setRows(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none" />
                </div>
                <div>
                  <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.cols}</label>
                  <input type="number" min={1} max={10} value={cols} onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none" />
                </div>
              </div>
              <label className="block font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t.keepApart}</label>
              <textarea value={keepApart} onChange={(e) => setKeepApart(e.target.value)} rows={3}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold outline-none resize-none mb-4"
                placeholder={t.keepApartPh} />
              <button onClick={doGenerate}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl border-4 border-black dark:border-white font-black uppercase text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform">
                <Shuffle size={16} /> {layout ? t.regenerate : t.generate}
              </button>
            </>
          )}
        </div>

        {layout && (
          <>
            {layout.violatingPairs.length > 0 && (
              <div className="flex items-start gap-2 mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-bold text-sm">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  {t.violations}{' '}
                  {layout.violatingPairs.map(([a, b], i) => (
                    <span key={i}>{i > 0 ? ', ' : ''}{names[a]} + {names[b]}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {layout.grid.map((idx, i) => (
                <div key={i} className={`aspect-[4/3] rounded-2xl border-[3px] flex items-center justify-center text-center p-2 font-bold text-sm ${idx === null ? 'border-dashed border-slate-300 dark:border-zinc-700 text-slate-300 dark:text-zinc-700' : 'border-black dark:border-white bg-white dark:bg-zinc-900'}`}>
                  {idx === null ? t.empty : names[idx]}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
