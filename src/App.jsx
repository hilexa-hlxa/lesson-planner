// src/App.jsx
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

import { DEFAULT_PROMPT_CONFIG } from "./lib/prompt";

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

  // ===== Global state =====
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "RU");

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);

  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("a11y_font") || "md");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("a11y_contrast") === "high");

  const [promptConfig, setPromptConfig] = useState(DEFAULT_PROMPT_CONFIG);
  const [promptHydrated, setPromptHydrated] = useState(false);

  // ===== Lang persist =====
  useEffect(() => {
    localStorage.setItem("app_lang", lang);
  }, [lang]);

  // (опционально) синхронизация при смене роутов/вкладок
  useEffect(() => {
    const saved = localStorage.getItem("app_lang");
    if (saved && saved !== lang) setLang(saved);
  }, [location.pathname]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "app_lang" && e.newValue && e.newValue !== lang) {
        setLang(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [lang]);

  // ===== Prompt config per-user =====
  useEffect(() => {
    if (!user?.id) return;

    const key = `app_prompt_config:${user.id}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        setPromptConfig(JSON.parse(saved));
      } catch {
        setPromptConfig(DEFAULT_PROMPT_CONFIG);
      }
    } else {
      setPromptConfig(DEFAULT_PROMPT_CONFIG);
    }

    setPromptHydrated(true);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    if (!promptHydrated) return;

    const key = `app_prompt_config:${user.id}`;
    localStorage.setItem(key, JSON.stringify(promptConfig));
  }, [promptConfig, user, promptHydrated]);

  // ===== Theme / a11y =====
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (fontSize === "md") delete document.documentElement.dataset.font;
    else document.documentElement.dataset.font = fontSize;

    if (highContrast) document.documentElement.dataset.contrast = "high";
    else delete document.documentElement.dataset.contrast;

    localStorage.setItem("a11y_font", fontSize);
    localStorage.setItem("a11y_contrast", highContrast ? "high" : "normal");
  }, [fontSize, highContrast]);

  // ===== Auth bootstrap (me) =====
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
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    highContrast={highContrast}
                    setHighContrast={setHighContrast}
                    promptConfig={promptConfig}
                  />
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
    </>
  );
}
