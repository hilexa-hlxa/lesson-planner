import React, { useCallback, useEffect, useRef, useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";

import api from "./api";
import { meCached } from "./apiCache"; // Импортируем ме-кэш

import AuthModal from "./components/AuthModal";
import Protected from "./components/Protected";
import { META, resolveMeta } from "./lib/seoMeta";

// Каждая страница — отдельный чанк (см. ADR-0005): раньше все ~30 маршрутов,
// включая мини-игры и учительские инструменты, паковались в один бандл
// (877 КБ / 249 КБ gzip), и его целиком грузил даже гость на LandingPage.
// LandingPage остаётся обычным импортом — это первый экран почти для всех,
// и грузить его отдельным чанком означало бы лишний round-trip на каждый
// первый визит. Остальное — lazy: страница скачивается только когда на неё
// действительно переходят.
import LandingPage from "./pages/LandingPage";
const HubPage = lazy(() => import("./pages/HubPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PromptsPage = lazy(() => import("./pages/PromptsPage"));
const StudentJoinPage = lazy(() => import("./pages/StudentJoinPage"));
const CreateTestPage = lazy(() => import("./pages/CreateTestPage"));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const ClassesPage = lazy(() => import('./pages/ClassesPage'));
const ClassDetailPage = lazy(() => import('./pages/ClassDetailPage'));
const StudentClassesPage = lazy(() => import('./pages/StudentClassesPage'));
const WordlePage = lazy(() => import('./pages/WordlePage'));
const HangmanPage = lazy(() => import('./pages/HangmanPage'));
const MathBattlePage = lazy(() => import('./pages/MathBattlePage'));
const MemoryMatchPage = lazy(() => import('./pages/MemoryMatchPage'));
const WordSprintPage = lazy(() => import('./pages/WordSprintPage'));
const SortItOutPage = lazy(() => import('./pages/SortItOutPage'));
const TriviaRacePage = lazy(() => import('./pages/TriviaRacePage'));
const DailyChallengePage = lazy(() => import('./pages/DailyChallengePage'));
const LessonSummaryPage = lazy(() => import('./pages/LessonSummaryPage'));
const ReteachPlannerPage = lazy(() => import('./pages/ReteachPlannerPage'));
const ParentMessagePage = lazy(() => import('./pages/ParentMessagePage'));
const WorksheetGeneratorPage = lazy(() => import('./pages/WorksheetGeneratorPage'));
const DifferentiatedWorksheetPage = lazy(() => import('./pages/DifferentiatedWorksheetPage'));
const RubricBuilderPage = lazy(() => import('./pages/RubricBuilderPage'));
const TranslateMaterialsPage = lazy(() => import('./pages/TranslateMaterialsPage'));
const RandomGroupingPage = lazy(() => import('./pages/RandomGroupingPage'));
const SeatingChartPage = lazy(() => import('./pages/SeatingChartPage'));
const BehaviorLogPage = lazy(() => import('./pages/BehaviorLogPage'));
const FlashcardExportPage = lazy(() => import('./pages/FlashcardExportPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const QuizPlayer = lazy(() => import("./components/QuizPlayer"));

import { DEFAULT_PROMPT_CONFIG } from "./lib/prompt";
import { achievementReward, achievementText } from "./lib/achievements";
import ClassControlBar from './components/ClassControlBar';
import AchievementToast from "./components/AchievementToast";

// Тот же вид, что и заглушка в Protected.jsx, — единообразный флеш между
// переходом по ссылке и подгрузкой чанка страницы.
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center">Loading...</div>
);

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

  // Принимает КЛЮЧ достижения; название и награда берутся из общего каталога,
  // поэтому тост говорит на языке интерфейса, а не всегда по-русски.
  const grantAchievement = useCallback((key) => {
    if (!key || typeof key !== "string") return;

    // Гость (ученик, вошедший в тест по коду) — аккаунта для начисления нет.
    // Раньше здесь была мутация user.achievements, которая падала с TypeError
    // и обрывала завершение теста ДО отправки результата на сервер.
    if (!user) return;

    if (grantedKeysRef.current.has(key)) return;
    if (user.achievements?.includes(key)) return;

    const reward = achievementReward(key);

    grantedKeysRef.current.add(key);
    setActiveAchievement(key);

    setUser(prev => prev ? ({
      ...prev,
      coins: (prev.coins || 0) + reward,
      achievements: [...(prev.achievements || []), key]
    }) : prev);

    // Раньше начисление жило только в этом optimistic setUser — коины и ачивки
    // переживали до первого обновления страницы, а после логина заново их не
    // было (кроме visit_profile, который персистился отдельно на ProfilePage).
    // Теперь каждый грант доходит и до сервера; при отказе — откатываем
    // локально, чтобы можно было попробовать снова.
    api.achievements.grant(key).catch((e) => {
      console.error("Achievement grant failed to persist", key, e);
      grantedKeysRef.current.delete(key);
      setUser(prev => prev ? ({
        ...prev,
        coins: Math.max(0, (prev.coins || 0) - reward),
        achievements: (prev.achievements || []).filter(k => k !== key),
      }) : prev);
    });
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

  // SEO: заголовок, описание и lang документа следуют за выбранным языком.
  // META/ROUTE_META живут в src/lib/seoMeta.js — их же читает
  // scripts/prerender-meta.mjs при сборке, чтобы краулеры, не исполняющие
  // JS, видели правильные теги ещё до того, как отработает этот эффект.
  useEffect(() => {
    const m = resolveMeta(lang, location.pathname);
    const code = (META[lang] || META.RU).code;

    document.title = m.title;
    document.documentElement.setAttribute("lang", code);
    document.querySelector('meta[name="description"]')?.setAttribute("content", m.desc);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", m.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", m.desc);
    // Canonical должен указывать на текущий путь, а не всегда на "/" — иначе
    // поисковик считает канонической только главную и может не индексировать
    // /pricing, /privacy и /terms отдельно.
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", `https://lessonplanner.kz${location.pathname}`);

    localStorage.setItem("app_lang", lang);
  }, [lang, location.pathname]);

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
    // reducedMotion="user" — framer-motion уже умеет уважать
    // prefers-reduced-motion, просто раньше этого нигде не было включено:
    // все motion.div/AnimatePresence в приложении (переходы между
    // страницами в Page, лендинг, тосты) анимировались одинаково для всех,
    // независимо от системной настройки "уменьшить движение". Один враппер
    // здесь покрывает вообще все motion-компоненты приложения — обходить
    // каждый вручную не нужно.
    <MotionConfig reducedMotion="user">
      <AuthModal
        isOpen={isAuthOpen} mode={authMode} setMode={setAuthMode}
        onClose={() => setIsAuthOpen(false)} email={email} setEmail={setEmail}
        pass={pass} setPass={setPass} setUser={setUser} lang={lang}
        showEmailError={showEmailError} setShowEmailError={setShowEmailError}
        isFormValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && pass.length >= 8}
      />

      <Suspense fallback={<RouteFallback />}>
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
          <Route path="/hangman" element={<Page><Protected authReady={authReady} user={user}><HangmanPage {...accessProps} /></Protected></Page>} />
          <Route path="/math-battle" element={<Page><Protected authReady={authReady} user={user}><MathBattlePage {...accessProps} /></Protected></Page>} />
          <Route path="/memory-match" element={<Page><Protected authReady={authReady} user={user}><MemoryMatchPage {...accessProps} /></Protected></Page>} />
          <Route path="/word-sprint" element={<Page><Protected authReady={authReady} user={user}><WordSprintPage {...accessProps} /></Protected></Page>} />
          <Route path="/sort-it-out" element={<Page><Protected authReady={authReady} user={user}><SortItOutPage {...accessProps} /></Protected></Page>} />
          <Route path="/trivia-race" element={<Page><Protected authReady={authReady} user={user}><TriviaRacePage {...accessProps} /></Protected></Page>} />
          <Route path="/daily-challenge" element={<Page><Protected authReady={authReady} user={user}><DailyChallengePage {...accessProps} /></Protected></Page>} />
          <Route path="/lesson-summary" element={<Page><Protected authReady={authReady} user={user}><LessonSummaryPage {...accessProps} /></Protected></Page>} />
          <Route path="/reteach-planner" element={<Page><Protected authReady={authReady} user={user}><ReteachPlannerPage {...accessProps} /></Protected></Page>} />
          <Route path="/parent-message" element={<Page><Protected authReady={authReady} user={user}><ParentMessagePage {...accessProps} /></Protected></Page>} />
          <Route path="/worksheet-generator" element={<Page><Protected authReady={authReady} user={user}><WorksheetGeneratorPage {...accessProps} /></Protected></Page>} />
          <Route path="/differentiated-worksheet" element={<Page><Protected authReady={authReady} user={user}><DifferentiatedWorksheetPage {...accessProps} /></Protected></Page>} />
          <Route path="/rubric-builder" element={<Page><Protected authReady={authReady} user={user}><RubricBuilderPage {...accessProps} /></Protected></Page>} />
          <Route path="/translate-materials" element={<Page><Protected authReady={authReady} user={user}><TranslateMaterialsPage {...accessProps} /></Protected></Page>} />
          <Route path="/random-grouping" element={<Page><Protected authReady={authReady} user={user}><RandomGroupingPage {...accessProps} /></Protected></Page>} />
          <Route path="/seating-chart" element={<Page><Protected authReady={authReady} user={user}><SeatingChartPage {...accessProps} /></Protected></Page>} />
          <Route path="/behavior-log" element={<Page><Protected authReady={authReady} user={user}><BehaviorLogPage {...accessProps} /></Protected></Page>} />
          <Route path="/flashcard-export" element={<Page><Protected authReady={authReady} user={user}><FlashcardExportPage {...accessProps} /></Protected></Page>} />
          <Route path="/play" element={<QuizPlayer {...accessProps} />} />

          <Route path="/pricing" element={<Page><PricingPage {...accessProps} setIsAuthOpen={setIsAuthOpen} setAuthMode={setAuthMode} resetAuthFields={resetAuthFields} /></Page>} />
          <Route path="/privacy" element={<Page><PrivacyPage {...accessProps} /></Page>} />
          <Route path="/terms" element={<Page><TermsPage {...accessProps} /></Page>} />

          <Route path="*" element={<Page><NotFoundPage user={user} lang={lang} /></Page>} />
        </Routes>
      </AnimatePresence>
      </Suspense>

      <AchievementToast
        achievement={activeAchievement && {
          ...achievementText(activeAchievement, lang),
          reward: achievementReward(activeAchievement),
        }}
        onClose={() => setActiveAchievement(null)}
        lang={lang}
      />
      
      {isWidgetVisible && <ClassControlBar />}
    </MotionConfig>
  );
}