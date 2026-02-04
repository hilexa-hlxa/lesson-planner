const API_PREFIX = '/api';

// Вспомогательная функция "Ждун"
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Основная функция запросов с защитой от 429
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

      // --- ЛОВИМ 429 (Too Many Requests) ---
      if (res.status === 429) {
        if (i === retries) {
            // Если попытки кончились
            const err = new Error("Gemini HTTP 429: Слишком много запросов. Подождите.");
            err.status = 429;
            throw err;
        }
        // Ждем: 2с, потом 4с, потом 6с
        const delay = 2000 * (i + 1);
        console.warn(`⚠️ 429 Detected. Retrying in ${delay}ms...`);
        await wait(delay);
        continue; // Идем на следующий круг
      }

      // Обработка обычного ответа
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
      // Если это наша ошибка 429 или 4xx/5xx от сервера (после всех попыток) - выкидываем
      if (err.status) throw err;
      
      // Если ошибка сети (интернет пропал), пробуем еще раз
      if (i === retries) throw err;
      await wait(1000);
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

  // Стрим тоже защищаем от 429
  generateStream: async function* ({ prompt }) {
    let res;
    const retries = 3;

    // Цикл повторов только для подключения
    for (let i = 0; i <= retries; i++) {
        res = await fetch(`/api/generate/stream`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });

        if (res.status === 429) {
            if (i === retries) throw new Error("HTTP 429: Server Busy");
            console.warn(`⚠️ Stream 429. Retrying...`);
            await wait(2000 * (i + 1));
            continue;
        }
        break; // Если не 429, выходим из цикла и читаем поток
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
      return request(`/generations?limit=${encodeURIComponent(limit)}`, {
        method: 'GET'
      });
    },

    get: (id) => {
      return request(`/generations/${id}`, {
        method: 'GET'
      });
    },

    create: (payload) => {
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
    get: () => request('/prompt-config', { method: 'GET' }),
    set: (config) =>
      request('/prompt-config', {
        method: 'PUT',
        body: JSON.stringify({ config }),
      }),
  }
};

export default api;