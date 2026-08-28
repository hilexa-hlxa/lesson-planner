import { useEffect, useRef } from "react";

// Закрывает модалку/меню по Esc — общий кусок, который раньше был не в
// каждом оверлее: клавиатурный пользователь мог выйти только кликом по ×
// или по фону, если он вообще кликабелен.
//
// onEscape передаётся через ref, а не в deps эффекта: большинство вызовов —
// инлайн-стрелки вида () => setShowModal(false), пересоздающиеся на каждый
// рендер. Без ref эффект бы дёргал add/removeEventListener на каждый рендер,
// пока модалка открыта — с ref он переподписывается только когда меняется
// сам active.
export default function useEscapeKey(active, onEscape) {
  const cbRef = useRef(onEscape);
  // Отдельный эффект без deps — держит cbRef.current свежим на каждый
  // рендер, но не трогает ref прямо в теле рендера (react-hooks/refs).
  useEffect(() => { cbRef.current = onEscape; });

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => { if (e.key === "Escape") cbRef.current(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);
}
