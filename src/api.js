const API_PREFIX = '/api';

// Utility helper for delay (Exponential Backoff)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper for fetch with retry logic for HTTP 429 errors
async function request(path, options = {}, retries = 3) {
  const url = `${API_PREFIX}${path}`;
  const fetchOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, fetchOptions);

      // Handle Rate Limiting (HTTP 429)
      if (res.status === 429) {
        if (i === retries) {
            const err = new Error("API Rate Limit Exceeded. Please try again later.");
            err.status = 429;
            throw err;
        }
        
        // Exponential backoff: 5s, 10s, 15s
        const delay = 5000 * (i + 1); 
        console.warn(`[API] 429 Too Many Requests. Retrying in ${delay / 1000}s...`);
        
        await wait(delay);
        continue;
      }

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

    } catch (err) {
      if (err.status) throw err; // Re-throw strict API errors
      if (i === retries) throw err; // Re-throw network errors on last attempt
      await wait(2000); // Small delay for network jitters
    }
  }
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

  // Stream generation with retry support
  generateStream: async function* ({ prompt }) {
    let res;
    const retries = 3;

    for (let i = 0; i <= retries; i++) {
        res = await fetch(`/api/generate/stream`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });

        if (res.status === 429) {
            if (i === retries) throw new Error("HTTP 429: Service Busy");
            
            const delay = 5000 * (i + 1);
            console.warn(`[Stream] 429 Detected. Retrying in ${delay / 1000}s...`);
            await wait(delay);
            continue;
        }
        break;
    }

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

      let idx;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const chunk = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

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
    list: (limit = 50) => request(`/generations?limit=${encodeURIComponent(limit)}`, { method: 'GET' }),
    get: (id) => request(`/generations/${id}`, { method: 'GET' }),
    create: (payload) => request(`/generations`, { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/generations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    remove: async (id) => { await request(`/generations/${id}`, { method: 'DELETE' }); return true; }
  },

  promptConfig: {
    get: () => request('/prompt-config', { method: 'GET' }),
    set: (config) => request('/prompt-config', { method: 'PUT', body: JSON.stringify({ config }) }),
  }
};

export default api;