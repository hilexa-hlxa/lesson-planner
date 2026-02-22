import React from "react";
import { LANGS } from "../lib/i18n";

export default function LanguageSwitcher({ lang, setLang }) {
  const positions = { KZ: "4px", RU: "46px", EN: "88px" };

  return (
    <div className="relative flex bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-full border border-slate-200 dark:border-zinc-700 w-[132px] h-[42px] items-center shrink-0 shadow-sm transition-all">
      <div
        className="absolute h-[30px] w-[40px] bg-white dark:bg-zinc-500 rounded-full shadow-md transition-all duration-300 ease-in-out"
        style={{ left: positions[lang] || "46px" }}
      />
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`relative z-10 w-[40px] h-full text-[13px] font-black transition-colors duration-300 flex items-center justify-center ${
            lang === l ? "text-blue-600 dark:text-white" : "opacity-40 hover:opacity-100"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
