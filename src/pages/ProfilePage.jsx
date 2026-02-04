import React, { useState, useEffect, useRef } from "react"; // <-- Добавил useRef
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { I18N as t } from "../lib/i18n";
import Footer from "../components/Footer";
import AchievementToast from "../components/AchievementToast";

const API_URL = 'http://localhost:8000/api'; 
const ACHIEVEMENT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3';

export default function ProfilePage({ lang, user }) {
  const cur = t[lang]?.prof || t.RU.prof;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, reward: 0 });

  // 1. СОЗДАЕМ АУДИО ЗАРАНЕЕ (через useRef, чтобы не пересоздавалось)
  const audioRef = useRef(new Audio(ACHIEVEMENT_SOUND));

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("user_profile");
    return saved
      ? JSON.parse(saved)
      : {
          firstName: "John",
          lastName: "Doe",
          username: "@Guest",
          avatar: "https://moyashkola.gosuslugi.ru/netcat_files/9/67/avatar_0.png",
        };
  });

  const [tempData, setTempData] = useState(profileData);

  useEffect(() => {
    // 2. ПРИНУДИТЕЛЬНО ГРУЗИМ ЗВУК ПРИ ВХОДЕ НА СТРАНИЦУ
    // Это уберет задержку перед воспроизведением
    audioRef.current.preload = 'auto';
    audioRef.current.volume = 0.5;
    audioRef.current.load(); // Команда браузеру: "Качай прямо сейчас!"

    const checkAchievement = async () => {
      try {
        const response = await fetch(`${API_URL}/achievements/grant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ key: 'visit_profile' })
        });

        if (response.ok) {
          const json = await response.json();
          const result = json.data || json; 

          if (result.new) {
            // 3. ТЕПЕРЬ ОН СРАБОТАЕТ МГНОВЕННО (файл уже в памяти)
            // .catch нужен, если браузер блокирует авто-аудио (бывает в Chrome)
            audioRef.current.play().catch(e => console.log("Audio blocked:", e));
            
            setToast({ show: true, reward: result.reward });

            if (result.coins !== undefined) {
               localStorage.setItem('l_coins', result.coins);
               window.dispatchEvent(new Event('storage'));
            }
          }
        }
      } catch (e) {
        console.error("Achievement check failed:", e);
      }
    };

    checkAchievement();
  }, []);

  const handleSave = () => {
    setProfileData(tempData);
    localStorage.setItem("user_profile", JSON.stringify(tempData));
    setIsEditOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white p-10 font-sans relative">
      
      <AchievementToast 
        show={toast.show} 
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
        title="Achievement Unlocked!"
        reward={toast.reward}
        description="You visited your profile page for the first time."
      />

      {/* ОСТАЛЬНОЙ КОД БЕЗ ИЗМЕНЕНИЙ */}
      <div className="max-w-[1300px] mx-auto mb-10">
        <Link to="/hub" className="inline-flex items-center gap-2 font-black uppercase text-[10px] hover:text-blue-600 transition tracking-widest">
          <ChevronRight size={14} className="rotate-180" /> {cur.back}
        </Link>
      </div>

      <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-72 shrink-0">
          <div className="w-full aspect-square bg-slate-200 dark:bg-zinc-800 border-[4px] border-black dark:border-white rounded-xl overflow-hidden mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <img src={profileData.avatar} alt="avatar" className="w-full h-full object-cover grayscale" />
          </div>
          <div className="space-y-1 mb-6">
            <h1 className="text-3xl font-black tracking-tighter leading-tight">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-xl opacity-40 font-bold tracking-tight">{profileData.username}</p>
          </div>
          <button
            onClick={() => {
              setTempData(profileData);
              setIsEditOpen(true);
            }}
            className="w-full py-3 bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {cur.edit}
          </button>
        </div>

        <div className="flex-1 w-full h-[500px] bg-white dark:bg-zinc-900/30 border-[4px] border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] flex items-center justify-center border-dashed opacity-60">
          <p className="font-black uppercase text-[10px] tracking-[0.4em] opacity-10 italic">{cur.empty}</p>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white p-10 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-black uppercase mb-8 tracking-tighter">{cur.edit}</h2>
            <div className="space-y-5">
              <input
                value={tempData.firstName}
                onChange={(e) => setTempData({ ...tempData, firstName: e.target.value })}
                placeholder="First Name"
                className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-2 border-black rounded-xl font-bold outline-none"
              />
              <input
                value={tempData.lastName}
                onChange={(e) => setTempData({ ...tempData, lastName: e.target.value })}
                placeholder="Last Name"
                className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-2 border-black rounded-xl font-bold outline-none"
              />
              <input
                value={tempData.username}
                onChange={(e) => setTempData({ ...tempData, username: e.target.value })}
                placeholder="Username"
                className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-2 border-black rounded-xl font-bold outline-none text-blue-600"
              />
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsEditOpen(false)} className="flex-1 py-4 border-2 border-black rounded-xl font-black uppercase text-xs">
                  {cur.cancel}
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-4 bg-blue-600 text-white border-2 border-black rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  {cur.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}