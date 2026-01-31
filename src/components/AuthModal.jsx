import React, { useState } from "react";
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

  const currentLangData = t[lang] || t.RU;
  const authT = currentLangData.auth;

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "signup") await api.signup(email, pass, null);
      await api.login(email, pass);

      invalidate("me");
      const me = await cached("me", () => api.me(), {}, 60_000);

      setUser(me.user);
      onClose();
      navigate("/hub");
    } catch {
      alert("Auth Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-white/80 dark:bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-12 rounded-[44px] shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 opacity-30 hover:opacity-100 font-bold text-2xl">
          ✕
        </button>

        <h2 className="text-4xl font-black mb-10 tracking-tight text-slate-900 dark:text-white">
          {mode === "login" ? authT.loginTitle : authT.signupTitle}
        </h2>

        <div className="space-y-6">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setShowEmailError(true)}
            type="email"
            placeholder={authT.email}
            className={`w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-blue-500 transition ${
              showEmailError && !isEmailValid ? "border-red-500" : ""
            }`}
          />

          <div className="relative">
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              type={showPass ? "text" : "password"}
              placeholder={authT.pass}
              className="w-full p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-blue-500"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30">
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            disabled={!isFormValid || loading}
            onClick={handleSubmit}
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all ${
              isFormValid && !loading
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-slate-200 dark:bg-zinc-800 text-slate-400 opacity-50"
            }`}
          >
            {loading ? "..." : authT.enter}
          </button>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-[12px] uppercase font-bold opacity-40 hover:opacity-100 block mx-auto mt-6 tracking-widest text-slate-900 dark:text-white"
          >
            {mode === "login" ? authT.switchL : authT.switchS}
          </button>
        </div>
      </div>
    </div>
  );
}
