import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import api from "./api";
import { cached, invalidate } from "./apiCache";

import AuthModal from "./components/AuthModal";
import Protected from "./components/Protected";

import LandingPage from "./pages/LandingPage";
import HubPage from "./pages/HubPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import PromptsPage from "./pages/PromptsPage";
import StudentJoinPage from "./pages/StudentJoinPage";
import CreateTestPage from "./pages/CreateTestPage"; 

import { DEFAULT_PROMPT_CONFIG } from "./lib/prompt";
import ClassControlBar from './components/ClassControlBar';

const Page = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.18 }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const location = useLocation();

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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const r = await cached("me", () => api.me(), {}, 60_000);
        if (cancelled) return;
        setUser(r?.user || null);
      } catch {
        if (cancelled) return;
        setUser(null);
      } finally {
        if (cancelled) return;
        setAuthReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeRoutes = ["/hub", "/dashboard"];
  const isWidgetVisible = user && activeRoutes.includes(location.pathname);

  return (
    <>
      <AuthModal
        isOpen={isAuthOpen}
        mode={authMode}
        setMode={setAuthMode}
        onClose={() => setIsAuthOpen(false)}
        email={email}
        setEmail={setEmail}
        pass={pass}
        setPass={setPass}
        isFormValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && pass.length >= 8}
        setUser={setUser}
        isEmailValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
        showEmailError={showEmailError}
        setShowEmailError={setShowEmailError}
        lang={lang}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Page>
                <LandingPage
                  lang={lang}
                  setLang={setLang}
                  setIsAuthOpen={setIsAuthOpen}
                  setAuthMode={setAuthMode}
                  resetAuthFields={() => { setEmail(""); setPass(""); setShowEmailError(false); }}
                  user={user}
                  setUser={setUser}
                />
              </Page>
            }
          />

          <Route
            path="/hub"
            element={
              <Page>
                <Protected authReady={authReady} user={user}>
                  <HubPage
                    lang={lang}
                    setLang={setLang}
                    user={user}
                    setUser={setUser}
                  />
                </Protected>
              </Page>
            }
          />

          <Route
            path="/dashboard"
            element={
              <Page>
                <Protected authReady={authReady} user={user}>
                  <Dashboard
                    lang={lang}
                    setLang={setLang}
                    user={user}
                    setUser={setUser}
                    dark={dark}
                    setDark={setDark}
                    promptConfig={promptConfig}
                  />
                </Protected>
              </Page>
            }
          />

          {/* Pass config for prompt generation */}
          <Route
            path="/create-test"
            element={
              <Page>
                <Protected authReady={authReady} user={user}>
                  <CreateTestPage 
                    lang={lang} 
                    promptConfig={promptConfig} 
                  />
                </Protected>
              </Page>
            }
          />

          <Route
            path="/join-test"
            element={
              <Page>
                <Protected authReady={authReady} user={user}>
                  <StudentJoinPage />
                </Protected>
              </Page>
            }
          />

          <Route
            path="/profile"
            element={
              <Page>
                <Protected authReady={authReady} user={user}>
                  <ProfilePage lang={lang} user={user} />
                </Protected>
              </Page>
            }
          />

          <Route
            path="/prompts"
            element={
              <Page>
                <Protected authReady={authReady} user={user}>
                  <PromptsPage
                    lang={lang}
                    promptConfig={promptConfig}
                    setPromptConfig={setPromptConfig}
                  />
                </Protected>
              </Page>
            }
          />

          <Route path="*" element={<Navigate to={user ? "/hub" : "/"} replace />} />
        </Routes>
      </AnimatePresence>
      
      {isWidgetVisible && <ClassControlBar />}
    </>
  );
}