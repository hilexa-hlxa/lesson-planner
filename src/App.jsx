import React, { useCallback, useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import api from "./api";
import { meCached } from "./apiCache"; // Импортируем ме-кэш

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
import ClassesPage from './pages/ClassesPage';
import ClassDetailPage from './pages/ClassDetailPage';
import StudentClassesPage from './pages/StudentClassesPage';
import WordlePage from './pages/WordlePage';
import LessonSummaryPage from './pages/LessonSummaryPage';
import NotFoundPage from './pages/NotFoundPage';
import PricingPage from './pages/PricingPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

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
  const resetAuthFields = () => { setEmail(""); setPass(""); setShowEmailError(false); };

  // Ключи, выданные в этой сессии. Ref, а не стейт: setUser асинхронный, и без
  // синхронной отметки два вызова в одном тике выдали бы ачивку дважды.
  const grantedKeysRef = useRef(new Set());

  // Сбрасываем при смене пользователя (выход / вход под другим аккаунтом)
  useEffect(() => { grantedKeysRef.current = new Set(); }, [user?.id]);

  const grantAchievement = useCallback((achData) => {
    if (!achData?.key) return;

    // Гость (ученик, вошедший в тест по коду) — аккаунта для начисления нет.
    // Раньше здесь была мутация user.achievements, которая падала с TypeError
    // и обрывала завершение теста ДО отправки результата на сервер.
    if (!user) return;

    if (grantedKeysRef.current.has(achData.key)) return;
    if (user.achievements?.includes(achData.key)) return;

    grantedKeysRef.current.add(achData.key);
    setActiveAchievement(achData);

    setUser(prev => prev ? ({
      ...prev,
      coins: (prev.coins || 0) + (achData.reward || 0),
      achievements: [...(prev.achievements || []), achData.key]
    }) : prev);
  }, [user]);

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

  // Настройки генерации живут на пользователе. Раньше они существовали только
  // в этом стейте и сбрасывались при каждом обновлении вкладки.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) { setPromptConfig(DEFAULT_PROMPT_CONFIG); return; }

    let cancelled = false;
    (async () => {
      try {
        const r = await api.promptConfig.get();
        if (cancelled || !r?.config) return;
        // Мержим с дефолтами: сохранённый конфиг мог быть записан до появления
        // новых полей, и без слияния они оказались бы undefined
        setPromptConfig({
          lesson_plan: { ...DEFAULT_PROMPT_CONFIG.lesson_plan, ...(r.config.lesson_plan || {}) },
          tests:       { ...DEFAULT_PROMPT_CONFIG.tests,       ...(r.config.tests || {}) },
        });
      } catch (e) {
        console.error("Failed to load prompt config:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  // SEO: заголовок, описание и lang документа следуют за выбранным языком
  useEffect(() => {
    const META = {
      RU: {
        code: "ru",
        title: "Lesson Planner — планы уроков, тесты и отчёты за минуту",
        desc: "AI-платформа для учителей Казахстана: план урока за 60 секунд, тесты с кодом доступа без регистрации учеников, готовый отчёт для Кунделик.",
      },
      KZ: {
        code: "kk",
        title: "Lesson Planner — сабақ жоспарлары, тесттер және есептер бір минутта",
        desc: "Қазақстан мұғалімдеріне арналған AI-платформа: 60 секундта сабақ жоспары, кодпен кіретін тесттер, Кунделикке дайын есеп.",
      },
      EN: {
        code: "en",
        title: "Lesson Planner — lesson plans, quizzes and reports in a minute",
        desc: "AI platform for teachers in Kazakhstan: a lesson plan in 60 seconds, quizzes with an access code and no student signup, a ready report for Kundelik.",
      },
    };
    const m = META[lang] || META.RU;

    document.title = m.title;
    document.documentElement.setAttribute("lang", m.code);
    document.querySelector('meta[name="description"]')?.setAttribute("content", m.desc);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", m.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", m.desc);

    localStorage.setItem("app_lang", lang);
  }, [lang]);

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
  }, [dark, fontSize, highContrast, grantAchievement]);

  // --- 4. ПРОПСЫ ---
  const accessProps = { grantAchievement, dark, setDark, fontSize, setFontSize, highContrast, setHighContrast, lang, setLang, user, setUser };

  const activeRoutes = ["/hub", "/tools", "/games", "/classes"];
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
          <Route path="/" element={<Page><LandingPage {...accessProps} setIsAuthOpen={setIsAuthOpen} setAuthMode={setAuthMode} resetAuthFields={resetAuthFields} /></Page>} />
          <Route path="/hub" element={<Page><Protected authReady={authReady} user={user}><HubPage {...accessProps} /></Protected></Page>} />
          <Route path="/tools" element={<Page><Protected authReady={authReady} user={user}><ToolsPage {...accessProps} /></Protected></Page>} />
          <Route path="/games" element={<Page><Protected authReady={authReady} user={user}><GamesPage {...accessProps} /></Protected></Page>} />
          
          {["/dashboard", "/generate"].map((path) => (
            <Route key={path} path={path} element={<Page><Protected authReady={authReady} user={user}><Dashboard {...accessProps} promptConfig={promptConfig} /></Protected></Page>} />
          ))}

          <Route path="/create-test" element={<Page><Protected authReady={authReady} user={user}><CreateTestPage {...accessProps} promptConfig={promptConfig} /></Protected></Page>} />
          <Route path="/profile" element={<Page><Protected authReady={authReady} user={user}><ProfilePage {...accessProps} /></Protected></Page>} />
          <Route path="/prompts" element={<Page><Protected authReady={authReady} user={user}><PromptsPage {...accessProps} promptConfig={promptConfig} setPromptConfig={setPromptConfig} /></Protected></Page>} />
          {/* Вход в тест — БЕЗ авторизации. Весь смысл в том, что ученик
              заходит по коду и без аккаунта; под Protected эта страница
              разворачивала гостя на лендинг, как и /play рядом. */}
          <Route path="/join-test" element={<Page><StudentJoinPage {...accessProps} /></Page>} />
          <Route path="/classes" element={<Page><Protected authReady={authReady} user={user}><ClassesPage {...accessProps} /></Protected></Page>} />
          <Route path="/classes/:id" element={<Page><Protected authReady={authReady} user={user}><ClassDetailPage {...accessProps} /></Protected></Page>} />
          <Route path="/my-classes" element={<Page><Protected authReady={authReady} user={user}><StudentClassesPage {...accessProps} /></Protected></Page>} />
          <Route path="/wordle" element={<Page><Protected authReady={authReady} user={user}><WordlePage {...accessProps} /></Protected></Page>} />
          <Route path="/lesson-summary" element={<Page><Protected authReady={authReady} user={user}><LessonSummaryPage {...accessProps} /></Protected></Page>} />
          <Route path="/play" element={<QuizPlayer {...accessProps} />} />

          <Route path="/pricing" element={<Page><PricingPage {...accessProps} setIsAuthOpen={setIsAuthOpen} setAuthMode={setAuthMode} resetAuthFields={resetAuthFields} /></Page>} />
          <Route path="/privacy" element={<Page><PrivacyPage {...accessProps} /></Page>} />
          <Route path="/terms" element={<Page><TermsPage {...accessProps} /></Page>} />

          <Route path="*" element={<Page><NotFoundPage user={user} lang={lang} /></Page>} />
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