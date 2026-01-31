const API_PREFIX = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_PREFIX}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

const api = {
  request,

  login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  signup(email, password, displayName) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName })
    });
  },

  me() {
    return request('/me');
  },

  logout() {
    return request('/auth/logout', {
      method: 'POST'
    });
  },

  generateStream: async function* ({ prompt }) {
    const res = await fetch(`/api/generate/stream`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `HTTP ${res.status}`);
    }
    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });

      // SSE события разделены \n\n
      let idx;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const chunk = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

        // Ищем строку data:
        const line = chunk.split("\n").find((l) => l.startsWith("data: "));
        if (!line) continue;

        const payload = line.slice(6);
        let evt;
        try { evt = JSON.parse(payload); } catch { continue; }

        if (evt.type === "delta") yield (evt.text || "");
        if (evt.type === "done") return;
        if (evt.type === "error") throw new Error(evt.message || "stream error");
      }
    }
  },

  generations: {
    list: (limit = 50) => {
      // ожидаем { items: [...] } (как ты писал)
      return request(`/generations?limit=${encodeURIComponent(limit)}`, {
        method: 'GET'
      });
    },

    get: (id) => {
      // ожидаем { item: {...} } или что ты вернешь с бэка
      return request(`/generations/${id}`, {
        method: 'GET'
      });
    },

    create: (payload) => {
      // ожидаем { id: ... }
      return request(`/generations`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    update: (id, payload) => {
      return request(`/generations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    },

    remove: async (id) => {
      await request(`/generations/${id}`, {
        method: 'DELETE'
      });
      return true;
    }
  },

  promptConfig: {
  get: () => request('/prompt-config', { method: 'GET' }), // ожидаем { config: {...} } или просто {...}
  set: (config) =>
    request('/prompt-config', {
      method: 'PUT',
      body: JSON.stringify({ config }),
    }),
}
};

export default api;
