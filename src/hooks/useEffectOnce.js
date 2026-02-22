import { useEffect, useRef } from "react";

/**
 * В dev+StrictMode React делает double-mount и вызывает effect дважды.
 * Этот хук гарантирует выполнение эффекта только один раз (на реальный маунт).
 */
export function useEffectOnce(effect) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    return effect?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
