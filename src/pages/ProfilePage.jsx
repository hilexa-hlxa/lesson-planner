import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Trophy, Award, Coins, User, Lock,
  Mail, Edit3, X, Zap, Timer, Target, Moon, BarChart3,
  Calculator, Brain, LifeBuoy, Keyboard, LayoutGrid, Crown, Flame
} from "lucide-react";
import { I18N as t } from "../lib/i18n";
import { invalidate } from "../apiCache";
import api from "../api";
import { achievementText } from "../lib/achievements";
import AchievementToast from "../components/AchievementToast";
import Footer from "../components/Footer";
import Header from "../components/Header";
import useEscapeKey from "../hooks/useEscapeKey";

const T = {
  RU: {
    balance: "Твой баланс",
    achievements: "Достижения",
    unlocked: "Открыто", locked: "Закрыто",
    teacher: "Учитель", student: "Ученик", parent: "Родитель",
    editTitle: "Редактировать",
    firstName: "Имя", lastName: "Фамилия",
    saving: "Сохраняем...", saveError: "Не удалось сохранить. Попробуйте ещё раз.",
    nameRequired: "Введите имя.",
    toastTitle: "Ачивка разблокирована!", toastDesc: "Первое посещение профиля.",
    progress: (a, b) => `${a} из ${b} открыто`,
  },
  KZ: {
    balance: "Сіздің балансыңыз",
    achievements: "Жетістіктер",
    unlocked: "Ашық", locked: "Жабық",
    teacher: "Мұғалім", student: "Оқушы", parent: "Ата-ана",
    editTitle: "Өңдеу",
    firstName: "Аты", lastName: "Тегі",
    saving: "Сақталуда...", saveError: "Сақтау мүмкін болмады. Қайталап көріңіз.",
    nameRequired: "Атыңызды енгізіңіз.",
    toastTitle: "Жетістік ашылды!", toastDesc: "Профильге алғашқы кіру.",
    progress: (a, b) => `${b} жетістіктің ${a} ашылды`,
  },
  EN: {
    balance: "Your balance",
    achievements: "Achievements",
    unlocked: "Unlocked", locked: "Locked",
    teacher: "Teacher", student: "Student", parent: "Parent",
    editTitle: "Edit profile",
    firstName: "First name", lastName: "Last name",
    saving: "Saving...", saveError: "Could not save. Try again.",
    nameRequired: "Enter your first name.",
    toastTitle: "Achievement unlocked!", toastDesc: "First visit to your profile.",
    progress: (a, b) => `${a} of ${b} unlocked`,
  },
};

// Порядок карточек на странице; тексты и награды — из общего каталога
const ACHIEVEMENT_ORDER = [
  { key: "visit_profile",    icon: Award,     color: "bg-purple-500" },
  { key: "architect_10",     icon: Trophy,    color: "bg-emerald-500" },
  { key: "ai_report_master", icon: BarChart3, color: "bg-blue-500" },
  { key: "perfect_score",    icon: Target,    color: "bg-green-500" },
  { key: "speedrunner",      icon: Timer,     color: "bg-orange-500" },
  { key: "night_owl",        icon: Moon,      color: "bg-indigo-500" },
  { key: "rich",             icon: Coins,     color: "bg-yellow-500" },
  { key: "math_whiz",        icon: Calculator, color: "bg-rose-500" },
  { key: "memory_master",    icon: Brain,      color: "bg-fuchsia-500" },
  { key: "hangman_hero",     icon: LifeBuoy,   color: "bg-cyan-600" },
  { key: "word_sprint_ace",  icon: Keyboard,   color: "bg-sky-500" },
  { key: "sorter_supreme",   icon: LayoutGrid, color: "bg-lime-600" },
  { key: "trivia_champion",  icon: Crown,      color: "bg-amber-500" },
  { key: "streak_3",         icon: Flame,      color: "bg-orange-400" },
  { key: "streak_7",         icon: Flame,      color: "bg-orange-500" },
  { key: "streak_30",        icon: Flame,      color: "bg-orange-600" },
];

// Инициалы вместо внешней картинки — аватар всегда доступен и не тянет чужой домен
function InitialsAvatar({ first, last }) {
  const initials = `${(first || "").trim()[0] || ""}${(last || "").trim()[0] || ""}`.toUpperCase() || "?";
  return (
    <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white font-black text-[64px] tracking-tighter select-none">
      {initials}
    </div>
  );
}

export default function ProfilePage({ lang, setLang, user, setUser, ...accessProps }) {
  const cur = t[lang]?.prof || t.RU.prof;
  const tr = T[lang] || T.RU;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempData, setTempData] = useState({ firstName: "", lastName: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEscapeKey(isEditOpen, () => setIsEditOpen(false));

  const [coins, setCoins] = useState(user?.coins || 0);
  const [unlocked, setUnlocked] = useState(() => new Set(user?.achievements || []));
  // Награда за только что открытую ачивку; заголовок берём из перевода при рендере
  const [toastReward, setToastReward] = useState(null);

  const scrollContainerRef = useRef(null);

  // Синхронизируем локальное состояние, когда пользователь подгрузился/обновился
  useEffect(() => {
    setCoins(user?.coins || 0);
    setUnlocked(new Set(user?.achievements || []));
  }, [user?.coins, user?.achievements]);

  const scroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  // Ачивка за первое посещение профиля
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const checkAchievement = async () => {
      try {
        const result = await api.achievements.grant('visit_profile');
        const data = result.data || result;
        if (!data.new) return;

        setToastReward(data.reward);
        setUnlocked(prev => new Set(prev).add('visit_profile'));
        if (data.coins !== undefined) {
          setCoins(data.coins);
          invalidate("me");
        }
      } catch (e) {
        console.error("Achievement check failed:", e);
      }
    };
    checkAchievement();
  }, [userId]);

  const openEdit = () => {
    setTempData({ firstName: user?.first_name || "", lastName: user?.last_name || "" });
    setSaveError("");
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!tempData.firstName.trim()) {
      setSaveError(tr.nameRequired);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const res = await api.updateMe({
        first_name: tempData.firstName.trim(),
        last_name: tempData.lastName.trim(),
      });
      invalidate("me");
      setUser(prev => ({ ...prev, ...(res.user || {
        first_name: tempData.firstName.trim(),
        last_name: tempData.lastName.trim(),
      }) }));
      setIsEditOpen(false);
    } catch (e) {
      console.error(e);
      setSaveError(tr.saveError);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const roleLabel = user.role === 'teacher' ? tr.teacher : user.role === 'parent' ? tr.parent : tr.student;

  const achievements = ACHIEVEMENT_ORDER.map(a => ({
    ...a,
    ...achievementText(a.key, lang),
    // "rich" считается по балансу, остальные — по выданным ключам
    unlocked: a.key === 'rich' ? coins >= 500 : unlocked.has(a.key),
  }));
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[100px] lg:pt-[120px] pb-20">

      {/* ХЕДЕР (showProfile={false}, чтобы не было кнопки профиля внутри профиля) */}
      <Header
        lang={lang}
        setLang={setLang}
        user={user}
        setUser={setUser}
        showProfile={false}
        {...accessProps}
      />

      {/* CSS для скрытия скроллбара */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <AchievementToast
        achievement={toastReward === null ? null : { title: tr.toastTitle, reward: toastReward }}
        onClose={() => setToastReward(null)}
      />

      <main className="max-w-[1300px] mx-auto px-5 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

            {/* === ЛЕВАЯ КОЛОНКА (Инфо + Монеты) === */}
            <div className="w-full md:w-80 shrink-0 flex flex-col gap-6">

              {/* Карточка юзера */}
              <div>
                <div className="w-full max-w-[260px] md:max-w-none mx-auto aspect-square bg-slate-200 dark:bg-zinc-800 border-[4px] border-black dark:border-white rounded-xl overflow-hidden mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <InitialsAvatar first={user.first_name} last={user.last_name} />
                </div>
                <div className="space-y-1 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter leading-tight break-words">
                      {`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email}
                    </h1>
                    <p className="text-sm opacity-50 font-bold tracking-tight flex items-center gap-2 break-all">
                        <Mail size={14} className="shrink-0" /> {user.email}
                    </p>
                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-black mt-2
                        ${user.role === 'teacher' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'}`}>
                        {roleLabel}
                    </div>
                </div>

                <button
                    onClick={openEdit}
                    className="w-full py-3 bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                >
                    <Edit3 size={14} /> {cur.edit || tr.editTitle}
                </button>
              </div>

              {/* Карточка монет */}
              <div className="bg-yellow-400 text-black p-6 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{tr.balance}</span>
                 <div className="text-4xl sm:text-5xl font-black flex items-center gap-2 mt-1">
                    <Coins size={32} fill="white" className="text-black" />
                    {coins}
                 </div>
              </div>
            </div>

            {/* === ПРАВАЯ КОЛОНКА (Слайдер Ачивок) === */}
            <div className="flex-1 w-full min-w-0 bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(5,150,105,1)] p-5 sm:p-8 overflow-hidden flex flex-col min-h-[400px]">

              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b-2 border-slate-100 dark:border-zinc-800">
                 <div className="flex items-center gap-3 min-w-0">
                    <Trophy size={28} className="text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic">{tr.achievements}</h2>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {tr.progress(unlockedCount, achievements.length)}
                      </p>
                    </div>
                 </div>

                 {/* Кнопки навигации */}
                 <div className="hidden sm:flex gap-2 ml-auto">
                    <button onClick={() => scroll('left')} aria-label="Scroll left" className="p-2 border-2 border-black dark:border-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => scroll('right')} aria-label="Scroll right" className="p-2 border-2 border-black dark:border-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95">
                        <ChevronRight size={20} />
                    </button>
                 </div>
              </div>

              {/* КОНТЕЙНЕР ГОРИЗОНТАЛЬНОГО СКРОЛЛА */}
              <div
                 ref={scrollContainerRef}
                 className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory scroll-smooth items-stretch h-full"
              >
                 {achievements.map((ach) => {
                     const Icon = ach.icon;
                     return (
                       <div
                          key={ach.key}
                          className={`min-w-[200px] max-w-[200px] sm:min-w-[220px] sm:max-w-[220px] snap-start relative p-5 rounded-xl border-[3px] transition-all flex flex-col items-center text-center gap-4 shrink-0
                          ${ach.unlocked
                              ? 'bg-slate-50 dark:bg-zinc-800 border-black dark:border-zinc-500'
                              : 'bg-transparent border-slate-200 dark:border-zinc-800 opacity-60 grayscale'
                          }`}
                       >
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white border-2 border-black/10 shadow-sm ${ach.unlocked ? ach.color : 'bg-slate-300'}`}>
                              <Icon size={28} />
                          </div>

                          <div>
                              <div className="font-black uppercase text-xs mb-1">{ach.title}</div>
                              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">{ach.desc}</div>
                          </div>

                          {ach.unlocked ? (
                              <div className="mt-auto pt-2 text-green-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                                   <Award size={12} /> {tr.unlocked}
                              </div>
                          ) : (
                              <div className="mt-auto pt-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                                   <Lock size={12} /> {tr.locked}
                              </div>
                          )}
                       </div>
                     );
                 })}
              </div>

            </div>
          </div>
      </main>

      {/* === МОДАЛКА РЕДАКТИРОВАНИЯ === */}
      {isEditOpen && (
        <div onClick={() => setIsEditOpen(false)} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white p-6 sm:p-8 rounded-2xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
            <button
                onClick={() => setIsEditOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition"
            >
                <X size={20} />
            </button>

            <h2 className="text-2xl font-black uppercase mb-8 tracking-tighter">{tr.editTitle}</h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">{tr.firstName}</label>
                <input
                    value={tempData.firstName}
                    onChange={(e) => { setTempData({ ...tempData, firstName: e.target.value }); setSaveError(""); }}
                    maxLength={80}
                    aria-label={tr.firstName}
                    className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black dark:border-white rounded-xl font-bold outline-none focus:ring-4 ring-emerald-500/20"
                />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">{tr.lastName}</label>
                 <input
                    value={tempData.lastName}
                    onChange={(e) => { setTempData({ ...tempData, lastName: e.target.value }); setSaveError(""); }}
                    maxLength={80}
                    aria-label={tr.lastName}
                    className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black dark:border-white rounded-xl font-bold outline-none focus:ring-4 ring-emerald-500/20"
                 />
              </div>

              {saveError && (
                <p className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold">
                  {saveError}
                </p>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsEditOpen(false)}
                  disabled={saving}
                  className="flex-1 py-4 border-2 border-black dark:border-white rounded-xl font-black uppercase text-xs disabled:opacity-40"
                >
                  {cur.cancel || "Отмена"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-4 bg-black text-white dark:bg-white dark:text-black rounded-xl font-black uppercase text-xs disabled:opacity-40"
                >
                  {saving ? tr.saving : (cur.save || "Сохранить")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-16">
        <Footer lang={lang} />
      </div>
    </div>
  );
}
