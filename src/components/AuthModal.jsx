import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api";
import { cached, invalidate } from "../apiCache";
import { I18N as t } from "../lib/i18n";

export default function AuthModal({
  isOpen,
  mode,
  setMode,
  onClose,
  email,
  setEmail,
  pass,
  setPass,
  isFormValid,
  setUser,
  isEmailValid,
  showEmailError,
  setShowEmailError,
  lang = "RU",
}) {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");

  const closeModal = () => {
    setFirstName("");
    setLastName("");
    setRole("");
    setError("");
    onClose();
  };


  const currentLangData = t[lang] || t.RU;
  const authT = currentLangData.auth;

  // Esc закрывает модалку — стандартное ожидание для клавиатурных
  // пользователей, которого раньше не было (только клик по ✕).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      if (mode === "signup") {
        if (!firstName.trim() || !lastName.trim()) {
          setError(lang === "KZ" ? "Аты-жөніңізді енгізіңіз" : lang === "EN" ? "Enter your first and last name" : "Введите имя и фамилию");
          return;
        }
        if (!role) {
          setError(lang === "KZ" ? "Рөлді таңдаңыз" : lang === "EN" ? "Please select a role" : "Выберите роль");
          return;
        }

        await api.signup(email, pass, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
        });
      }

      await api.login(email, pass);

      invalidate("me");
      const me = await cached("me", () => api.me(), {}, 60_000);

      setUser(me.user);
      closeModal();
      navigate("/hub");
    } catch {
      setError(lang === "KZ" ? "Қате email немесе құпия сөз" : lang === "EN" ? "Incorrect email or password" : "Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-white/80 dark:bg-black/90 backdrop-blur-md p-4"
    >
      <div
        role="dialog" aria-modal="true" aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-12 rounded-[44px] shadow-2xl relative"
      >
        <button
          onClick={closeModal}
          aria-label={lang === "KZ" ? "Жабу" : lang === "EN" ? "Close" : "Закрыть"}
          className="absolute top-8 right-8 opacity-30 hover:opacity-100 font-bold text-2xl"
        >
          ✕
        </button>

        <h2 id="auth-modal-title" className="text-4xl font-black mb-10 tracking-tight text-slate-900 dark:text-white">
          {mode === "login" ? authT.loginTitle : authT.signupTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-4">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={authT.firstName}
                aria-label={authT.firstName}
                autoComplete="given-name"
                className="w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-emerald-500"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={authT.lastName}
                aria-label={authT.lastName}
                autoComplete="family-name"
                className="w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-emerald-500"
              />
            </div>
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setShowEmailError(true)}
            type="email"
            placeholder={authT.email}
            aria-label={authT.email}
            autoComplete="email"
            className={`w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-emerald-500 transition ${
              showEmailError && !isEmailValid ? "border-red-500" : ""
            }`}
          />

          <div className="relative">
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              type={showPass ? "text" : "password"}
              placeholder={authT.pass}
              aria-label={authT.pass}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass
                ? (lang === "KZ" ? "Құпия сөзді жасыру" : lang === "EN" ? "Hide password" : "Скрыть пароль")
                : (lang === "KZ" ? "Құпия сөзді көрсету" : lang === "EN" ? "Show password" : "Показать пароль")}
              className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {mode === "signup" && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-emerald-500 cursor-pointer appearance-none"
            >
              <option value="" disabled>{lang === "KZ" ? "Сіз кімсіз?" : lang === "EN" ? "Who are you?" : "Кто вы?"}</option>
              <option value="teacher">{authT.roleTeacher}</option>
              <option value="parent">{authT.roleParent}</option>
              <option value="student">{authT.roleStudent}</option>
            </select>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all ${
              isFormValid && !loading
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                : "bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 opacity-50"
            }`}
          >
            {loading ? "..." : (mode === "signup" ? (authT.signupEnter || authT.enter) : authT.enter)}
          </button>

          {error && (
            <div role="alert" className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="text-[12px] uppercase font-bold opacity-40 hover:opacity-100 block mx-auto mt-6 tracking-widest text-slate-900 dark:text-white"
          >
            {mode === "login" ? authT.switchL : authT.switchS}
          </button>
        </form>
      </div>
    </div>
  );
}
