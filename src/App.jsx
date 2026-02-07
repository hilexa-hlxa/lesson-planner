import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import api from "./api";
import { cached, meCached } from "./apiCache"; // Импортируем ме-кэш

import AuthModal from "./components/AuthModal";
import Protected from "./components/Protected";

import LandingPage from "./pages/LandingPage";
import HubPage from "./pages/HubPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import PromptsPage from "./pages/PromptsPage";
import StudentJoinPage from "./pages/StudentJoinPage";
import CreateTestPage from "./pages/CreateTestPage";
import ToolsPage from './pages/ToolsPage';
import GamesPage from './pages/GamesPage';

import { DEFAULT_PROMPT_CONFIG } from "./lib/prompt";
import ClassControlBar from './components/ClassControlBar';
import QuizPlayer from "./components/QuizPlayer";
import AchievementToast from "./components/AchievementToast";

const Page = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const location = useLocation();

  // --- 1. СТЕЙТЫ ---
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "RU");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [promptConfig, setPromptConfig] = useState(DEFAULT_PROMPT_CONFIG);
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || "md");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');
  const [activeAchievement, setActiveAchievement] = useState(null);

  // --- 2. ФУНКЦИИ ---
  const grantAchievement = (achData) => {
  // 1. СТРОГАЯ ПРОВЕРКА: Если ачивка уже в процессе или получена — СТОП
  if (user?.achievements?.includes(achData.key)) return;
  if (activeAchievement?.key === achData.key) return;

  // 2. Локально сразу помечаем, чтобы повторные вызовы в ту же миллисекунду не прошли
  user.achievements = [...(user.achievements || []), achData.key];

  setActiveAchievement(achData);

  // 3. Обновляем стейт (React сам сгруппирует обновления)
  setUser(prev => ({
    ...prev,
    coins: (prev?.coins || 0) + (achData.reward || 0),
    achievements: [...(prev?.achievements || []), achData.key]
  }));
};

  // --- 3. ЭФФЕКТЫ ---

  // Загрузка пользователя через кэш (300 сек = 5 минут)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await meCached(300_000); 
        if (cancelled) return;
        setUser(r?.user || null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Настройка консольной команды и темы
  useEffect(() => {
    window.testAchievement = grantAchievement;
    
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    if (highContrast) root.classList.add('high-contrast'); else root.classList.remove('high-contrast');
    root.setAttribute('data-font', fontSize);

    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('highContrast', highContrast);
  }, [dark, fontSize, highContrast]);

  // --- 4. ПРОПСЫ ---
  const accessProps = { grantAchievement, dark, setDark, fontSize, setFontSize, highContrast, setHighContrast, lang, setLang, user, setUser };

  const activeRoutes = ["/hub", "/tools", "/games"];
  const isWidgetVisible = user && user.role === 'teacher' && activeRoutes.includes(location.pathname);

  return (
    <>
      <AuthModal
        isOpen={isAuthOpen} mode={authMode} setMode={setAuthMode}
        onClose={() => setIsAuthOpen(false)} email={email} setEmail={setEmail}
        pass={pass} setPass={setPass} setUser={setUser} lang={lang}
        showEmailError={showEmailError} setShowEmailError={setShowEmailError}
        isFormValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && pass.length >= 8}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><LandingPage {...accessProps} setIsAuthOpen={setIsAuthOpen} setAuthMode={setAuthMode} resetAuthFields={() => { setEmail(""); setPass(""); setShowEmailError(false); }} /></Page>} />
          <Route path="/hub" element={<Page><Protected authReady={authReady} user={user}><HubPage {...accessProps} /></Protected></Page>} />
          <Route path="/tools" element={<Page><Protected authReady={authReady} user={user}><ToolsPage {...accessProps} /></Protected></Page>} />
          <Route path="/games" element={<Page><Protected authReady={authReady} user={user}><GamesPage {...accessProps} /></Protected></Page>} />
          
          {["/dashboard", "/generate"].map((path) => (
            <Route key={path} path={path} element={<Page><Protected authReady={authReady} user={user}><Dashboard {...accessProps} promptConfig={promptConfig} /></Protected></Page>} />
          ))}

          <Route path="/create-test" element={<Page><Protected authReady={authReady} user={user}><CreateTestPage {...accessProps} promptConfig={promptConfig} /></Protected></Page>} />
          <Route path="/profile" element={<Page><Protected authReady={authReady} user={user}><ProfilePage {...accessProps} /></Protected></Page>} />
          <Route path="/prompts" element={<Page><Protected authReady={authReady} user={user}><PromptsPage {...accessProps} promptConfig={promptConfig} setPromptConfig={setPromptConfig} /></Protected></Page>} />
          <Route path="/join-test" element={<Page><Protected authReady={authReady} user={user}><StudentJoinPage {...accessProps} /></Protected></Page>} />
          <Route path="/play" element={<QuizPlayer {...accessProps} />} />
          <Route path="*" element={<Navigate to={user ? "/hub" : "/"} replace />} />
        </Routes>
      </AnimatePresence>

      <AchievementToast 
        achievement={activeAchievement} 
        onClose={() => setActiveAchievement(null)} 
      />
      
      {isWidgetVisible && <ClassControlBar />}
    </>
  );
}