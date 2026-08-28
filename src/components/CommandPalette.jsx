import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import useEscapeKey from "../hooks/useEscapeKey";
import { getCommandPaletteItems } from "../lib/commandPaletteItems";

const T = {
  RU: { placeholder: "Куда перейти?", empty: "Ничего не найдено", hint: "для навигации", hintEnter: "открыть", hintEsc: "закрыть" },
  KZ: { placeholder: "Қайда өтеміз?", empty: "Ештеңе табылмады", hint: "аралау үшін", hintEnter: "ашу", hintEsc: "жабу" },
  EN: { placeholder: "Jump to…", empty: "Nothing found", hint: "to navigate", hintEnter: "open", hintEsc: "close" },
};

const GROUP_LABEL = {
  nav: L => L === "KZ" ? "Навигация" : L === "EN" ? "Navigation" : "Навигация",
  tools: L => L === "KZ" ? "Құралдар" : L === "EN" ? "Tools" : "Инструменты",
  games: L => L === "KZ" ? "Ойындар" : L === "EN" ? "Games" : "Игры",
};

// Header.jsx мount'ит этот компонент только пока палитра открыта
// ({paletteOpen && <CommandPalette .../>}) — так что каждое открытие само
// по себе даёт чистый useState (query="", activeIndex=0), без отдельного
// сброса в эффекте на смену isOpen.
export default function CommandPalette({ onClose, lang = "RU", user }) {
  const t = T[lang] || T.RU;
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState(query);
  const inputRef = useRef(null);

  const items = useMemo(() => getCommandPaletteItems(lang, !!user), [lang, user]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => i.searchable.includes(q)) : items;
  }, [items, query]);

  // Сброс выбора при смене запроса — во время рендера, а не в эффекте:
  // так React применяет оба setState до отрисовки кадра, без лишнего
  // прохода commit -> effect -> ре-рендер. См. "Adjusting state when a
  // prop changes" в реакт-доках.
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  useEscapeKey(true, onClose);

  // Автофокус в поле поиска — палитра открывается с клавиатуры (Cmd/Ctrl+K),
  // печатать нужно иметь возможность сразу, без клика по полю
  useEffect(() => { inputRef.current?.focus(); }, []);

  const go = (path) => {
    navigate(path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) go(item.path);
    }
  };

  // Группируем в порядке nav -> tools -> games, но только группы, у которых
  // есть хоть один результат — пустых заголовков секций быть не должно
  const groups = ["nav", "tools", "games"]
    .map((g) => ({ key: g, items: results.filter((i) => i.group === g) }))
    .filter((g) => g.items.length > 0);

  let flatIndex = -1;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] px-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.placeholder}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/10 dark:border-white/10">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            aria-activedescendant={results[activeIndex] ? `cmdk-item-${results[activeIndex].path}` : undefined}
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-listbox"
            autoComplete="off"
            className="flex-1 min-w-0 bg-transparent outline-none font-bold text-base sm:text-lg dark:text-white"
          />
        </div>

        <div id="cmdk-listbox" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <div className="px-4 py-10 text-center text-sm font-bold text-slate-400">{t.empty}</div>
          )}
          {groups.map((g) => (
            <div key={g.key} className="mb-1 last:mb-0">
              <div className="px-3 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                {GROUP_LABEL[g.key](lang)}
              </div>
              {g.items.map((item) => {
                flatIndex += 1;
                const idx = flatIndex;
                const Icon = item.icon;
                const active = idx === activeIndex;
                return (
                  <button
                    key={item.path}
                    id={`cmdk-item-${item.path}`}
                    role="option"
                    aria-selected={active}
                    onClick={() => go(item.path)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      active ? "bg-emerald-600 text-white" : "hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="font-bold text-sm truncate">{item.text}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 border-t border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>↑↓ {t.hint}</span>
          <span>↵ {t.hintEnter}</span>
          <span>Esc {t.hintEsc}</span>
        </div>
      </div>
    </div>
  );
}
