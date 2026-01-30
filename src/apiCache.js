import api from "./api";

// -------------
// helpers
// -------------
function makeKey(name, args) {
  return `${name}:${JSON.stringify(args ?? {})}`;
}

const store = new Map(); // key -> { at, ttl, data, promise }

export async function cached(name, fn, args, ttlMs = 60_000) {
  const key = makeKey(name, args);
  const now = Date.now();
  const entry = store.get(key);

  // 1) свежий кэш
  if (entry?.data && (now - entry.at) < entry.ttl) {
    return entry.data;
  }

  // 2) дедуп: если запрос уже идет — возвращаем тот же promise
  if (entry?.promise) {
    return entry.promise;
  }

  // 3) создаем новый запрос и кладем promise
  const p = (async () => {
    const data = await fn();
    store.set(key, { data, at: Date.now(), ttl: ttlMs, promise: null });
    return data;
  })().catch((e) => {
    // если упало — убираем promise, чтобы можно было ретраить
    const cur = store.get(key);
    if (cur?.promise) store.delete(key);
    throw e;
  });

  store.set(key, { data: entry?.data ?? null, at: entry?.at ?? 0, ttl: ttlMs, promise: p });
  return p;
}

export function invalidate(prefix) {
  // prefix: "generations.list" или "me"
  for (const k of store.keys()) {
    if (k.startsWith(prefix + ":")) store.delete(k);
  }
}

export function invalidatePrefixRaw(rawPrefix) {
  // rawPrefix: "generations." или "generations.get:" или любой startWith
  for (const k of store.keys()) {
    if (k.startsWith(rawPrefix)) store.delete(k);
  }
}


// -------------
// конкретные обертки
// -------------
export function meCached(ttlMs = 60_000) {
  return cached("me", () => api.me(), {}, ttlMs);
}

export function generationsListCached(limit = 50, ttlMs = 60_000) {
  return cached("generations.list", () => api.generations.list(limit), { limit }, ttlMs);
}

export function generationGetCached(id, ttlMs = 60_000) {
  return cached("generations.get", () => api.generations.get(id), { id }, ttlMs);
}
