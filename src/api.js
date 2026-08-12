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

  signup(email, password, payload = null) {
    const extra = (payload && typeof payload === "object") ? payload : { displayName: payload };
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...extra })
    });
  },

  me() {
    return request('/me');
  },

  updateMe({ first_name, last_name }) {
    return request('/me', {
      method: 'PATCH',
      body: JSON.stringify({ first_name, last_name })
    });
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

  // Планы уроков и тесты лежат в одной таблице и различаются полем type.
  // Фильтрует сервер: страница получает только своё.
  lessonPlans: {
    list: (limit = 50) => request(`/generations?type=lesson_plan&limit=${encodeURIComponent(limit)}`, { method: 'GET' }),
    get: (id) => request(`/generations/${id}`, { method: 'GET' }),
    create: (payload) => request(`/generations`, { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/generations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    remove: async (id) => { await request(`/generations/${id}`, { method: 'DELETE' }); return true; }
  },

  tests: {
    list: (limit = 50) => request(`/generations?type=test&limit=${encodeURIComponent(limit)}`, { method: 'GET' }),
    get: (id) => request(`/generations/${id}`, { method: 'GET' }),
    create: (payload) => request(`/generations`, { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/generations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    remove: async (id) => { await request(`/generations/${id}`, { method: 'DELETE' }); return true; }
  },

  promptConfig: {
    get: () => request('/prompt-config', { method: 'GET' }),
    set: (config) => request('/prompt-config', { method: 'PUT', body: JSON.stringify({ config }) }),
  },

  wordle: {
    getWord: (lang) => request(`/wordle/word?lang=${encodeURIComponent(lang)}`, { method: 'GET' }),
    createSession: (word, lang) => request('/wordle/session', { method: 'POST', body: JSON.stringify({ word, lang }) }),
    joinSession: (code) => request('/wordle/join', { method: 'POST', body: JSON.stringify({ code }) }),
  },

  student: {
    history: (classId) => request(`/student/history${classId ? `?class_id=${classId}` : ''}`, { method: 'GET' }),
  },

  quiz: {
    // Учительские
    start: (id, class_id = null) => request('/quiz/start', {
      method: 'POST',
      body: JSON.stringify(class_id ? { id, class_id } : { id })
    }),
    report: (id) => request(`/quiz/${id}/report`, { method: 'GET' }),

    // Ученические. Вопросы приходят без правильных ответов, а вход выдаёт токен
    // попытки: по нему сервер знает, на каком вопросе ученик, и хранит его
    // выборы. Ответы и балл клиент не присылает — их считает сервер.
    join: (code, student_name) => request('/quiz/join', {
      method: 'POST',
      body: JSON.stringify({ code, student_name })
    }),
    answer: (attempt_token, question_index, selected) => request('/quiz/answer', {
      method: 'POST',
      body: JSON.stringify({ attempt_token, question_index, selected })
    }),
    submit: ({ attempt_token, duration }) => request('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ attempt_token, duration })
    }),
  },

  achievements: {
    grant: (key) => request('/achievements/grant', {
      method: 'POST',
      body: JSON.stringify({ key })
    }),
  },

  classes: {
    list: () => request('/classes', { method: 'GET' }),
    create: (name) => request('/classes', { method: 'POST', body: JSON.stringify({ name }) }),
    get: (id) => request(`/classes/${id}`, { method: 'GET' }),
    join: (join_code) => request('/classes/join', { method: 'POST', body: JSON.stringify({ join_code }) }),
    getMembers: (id, status) => request(`/classes/${id}/members${status ? `?status=${status}` : ''}`, { method: 'GET' }),
    approve: (classId, studentId) => request(`/classes/${classId}/members/${studentId}/approve`, { method: 'POST' }),
    approveAll: (classId) => request(`/classes/${classId}/approve-all`, { method: 'POST' }),
    kick: (classId, studentId) => request(`/classes/${classId}/members/${studentId}`, { method: 'DELETE' }),
    getQuizzes: (id) => request(`/classes/${id}/quizzes`, { method: 'GET' }),
  },
};

export default api;