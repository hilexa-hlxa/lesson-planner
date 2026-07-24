import api from "./api";

const store = new Map(); // Память для дедупликации

function makeKey(name, args) {
  return `${name}:${JSON.stringify(args ?? {})}`;
}

export async function cached(name, fn, args, ttlMs = 60_000) {
  const key = makeKey(name, args);
  const now = Date.now();
  let entry = store.get(key);

  // 1. Проверяем кэш в памяти
  if (entry?.data && (now - entry.at) < entry.ttl) {
    return entry.data;
  }

  // 2. Дедупликация (если запрос уже летит)
  if (entry?.promise) return entry.promise;

  // 3. Создаем новый запрос
  const p = (async () => {
    const data = await fn();
    store.set(key, { data, at: Date.now(), ttl: ttlMs, promise: null });
    return data;
  })().catch((e) => {
    store.delete(key);
    throw e;
  });

  store.set(key, { data: entry?.data ?? null, at: entry?.at ?? 0, ttl: ttlMs, promise: p });
  return p;
}

// ЭКСПОРТЫ ДЛЯ ИНВАЛИДАЦИИ
export function invalidate(prefix) {
  for (const k of store.keys()) {
    if (k.startsWith(prefix + ":")) store.delete(k);
  }
}

export function invalidatePrefixRaw(rawPrefix) {
  for (const k of store.keys()) {
    if (k.startsWith(rawPrefix)) store.delete(k);
  }
}

// ГОТОВЫЕ ОБЕРТКИ
export function meCached(ttlMs = 60_000) {
  return cached("me", () => api.me(), {}, ttlMs);
}

export function lessonPlansListCached(limit = 50, ttlMs = 60_000) {
  return cached("lessonPlans.list", () => api.lessonPlans.list(limit), { limit }, ttlMs);
}