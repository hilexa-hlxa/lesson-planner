import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shuffle, Users } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';

const T = {
  RU: {
    title: 'СЛУЧАЙНЫЕ ГРУППЫ',
    pickClass: 'Выбери класс', noClasses: 'У тебя пока нет ни одного класса.',
    noStudents: 'В этом классе пока нет учеников.',
    groupSize: 'Размер группы', pairs: 'Пары', trios: 'Тройки', shuffle: 'Перемешать', group: 'Группа',
  },
  KZ: {
    title: 'КЕЗДЕЙСОҚ ТОПТАР',
    pickClass: 'Сыныпты таңда', noClasses: 'Сенде әзірге бір де сынып жоқ.',
    noStudents: 'Бұл сыныпта әзірге оқушы жоқ.',
    groupSize: 'Топ өлшемі', pairs: 'Жұптар', trios: 'Үштіктер', shuffle: 'Араластыру', group: 'Топ',
  },
  EN: {
    title: 'RANDOM GROUPING',
    pickClass: 'Pick a class', noClasses: "You don't have any classes yet.",
    noStudents: 'This class has no students yet.',
    groupSize: 'Group size', pairs: 'Pairs', trios: 'Trios', shuffle: 'Shuffle', group: 'Group',
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

function makeGroups(names, size) {
  const shuffled = shuffleArray(names);
  const groups = [];
  for (let i = 0; i < shuffled.length; i += size) groups.push(shuffled.slice(i, i + size));
  // последнюю неполную группу присоединяем к предыдущей, а не оставляем в одиночестве
  if (groups.length > 1 && groups[groups.length - 1].length === 1) {
    const last = groups.pop();
    groups[groups.length - 1].push(...last);
  }
  return groups;
}

const GROUP_COLORS = ['bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500', 'bg-purple-100 dark:bg-purple-900/30 border-purple-500', 'bg-amber-100 dark:bg-amber-900/30 border-amber-500', 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-500', 'bg-rose-100 dark:bg-rose-900/30 border-rose-500', 'bg-lime-100 dark:bg-lime-900/30 border-lime-500'];

export default function RandomGroupingPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [cls, setCls] = useState(null);
  const [members, setMembers] = useState([]);
  const [size, setSize] = useState(2);
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    api.classes.list().then((r) => setClasses(r.items || r.classes || [])).catch(() => {});
  }, []);

  const pickClass = async (c) => {
    setCls(c); setGroups(null);
    try {
      const r = await api.classes.getMembers(c.id, 'approved');
      setMembers(r.members || r.items || []);
    } catch {
      setMembers([]);
    }
  };

  const doShuffle = (groupSize = size) => {
    if (members.length === 0) return;
    setGroups(makeGroups(members.map(nameOf), groupSize));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-3xl mx-auto px-5 sm:px-6">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic break-words">{t.title}</h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000] mb-8">
          <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.pickClass}</label>
          {classes.length === 0 && <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-3">{t.noClasses}</p>}
          <div className="flex flex-wrap gap-2 mb-5">
            {classes.map((c) => (
              <button key={c.id} onClick={() => pickClass(c)}
                className={`px-4 py-2 rounded-xl border-[3px] font-bold text-sm transition-colors ${cls?.id === c.id ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                {c.name}
              </button>
            ))}
          </div>

          {cls && members.length === 0 && <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t.noStudents}</p>}

          {cls && members.length > 0 && (
            <>
              <label className="block font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t.groupSize}</label>
              <div className="flex gap-3">
                <button onClick={() => { setSize(2); doShuffle(2); }}
                  className={`flex-1 py-3 rounded-xl border-[3px] font-black uppercase text-sm ${size === 2 ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20'}`}>
                  {t.pairs}
                </button>
                <button onClick={() => { setSize(3); doShuffle(3); }}
                  className={`flex-1 py-3 rounded-xl border-[3px] font-black uppercase text-sm ${size === 3 ? 'border-black dark:border-white bg-slate-100 dark:bg-zinc-800' : 'border-black/20 dark:border-white/20'}`}>
                  {t.trios}
                </button>
                <button onClick={() => doShuffle()}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl border-[3px] border-black dark:border-white font-black uppercase text-sm flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
                  <Shuffle size={16} /> {t.shuffle}
                </button>
              </div>
            </>
          )}
        </div>

        {groups && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((g, i) => (
              <div key={i} className={`p-5 rounded-2xl border-[3px] ${GROUP_COLORS[i % GROUP_COLORS.length]}`}>
                <p className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-500 mb-2">
                  <Users size={14} /> {t.group} {i + 1}
                </p>
                <ul className="space-y-1">
                  {g.map((name, j) => <li key={j} className="font-bold">{name}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
