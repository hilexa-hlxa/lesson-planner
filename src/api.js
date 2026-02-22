const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_PREFIX = '/api';
const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 12000);
const IDENTITY_KEY = 'lp_identity_email';
const USER_ID_KEY = 'lp_user_id';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, options = {}, requestOptions = {}) {
  const { retries = 2, timeoutMs = DEFAULT_TIMEOUT_MS } = requestOptions;
  const url = `${API_BASE_URL}${API_PREFIX}${path}`;
  const identityEmail = localStorage.getItem(IDENTITY_KEY);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers: {
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...(identityEmail ? { 'X-User-Id': identityEmail } : {}),
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const error = new Error(payload?.error || payload || `HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return payload;
    } catch (error) {
      clearTimeout(timeout);
      const retryable = !error.status || error.status >= 500 || error.name === 'AbortError' || error.status === 429;
      if (attempt >= retries || !retryable) {
        throw error;
      }

      await sleep(300 * (2 ** attempt));
    }
  }

  throw new Error('Unexpected request failure');
}

const api = {
  request,
  login: async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (data?.userId) {
      localStorage.setItem(USER_ID_KEY, data.userId);
    }
    localStorage.setItem(IDENTITY_KEY, email);
    return data;
  },
  signup: (email, password, payload = {}) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, ...payload }),
  }),
  me: () => request('/me'),
  getUserId: () => localStorage.getItem(USER_ID_KEY),

  generations: {
    list: (userId) => request(userId ? `/generations?userId=${encodeURIComponent(userId)}` : '/generations'),
    get: (id) => request(`/generations/${id}`),
    create: (payload, requestOptions = {}) => request('/generations', { method: 'POST', body: JSON.stringify(payload) }, { retries: 1, timeoutMs: 25000, ...requestOptions }),
    update: (id, payload) => request(`/generations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    remove: (id) => request(`/generations/${id}`, { method: 'DELETE' }),
    exportDocx: (id) => `${API_BASE_URL}${API_PREFIX}/generations/${id}/export-docx`,
  },

  quiz: {
    start: (payload) => request('/quiz/start', { method: 'POST', body: JSON.stringify(payload) }),
    join: (payload) => {
      const accessCode = typeof payload === 'string' ? payload : (payload?.accessCode || payload?.access_code);
      if (!accessCode) {
        throw new Error('accessCode is required for quiz.join');
      }
      return request('/quiz/join', { method: 'POST', body: JSON.stringify({ accessCode }) });
    },
    submit: (payload) => request('/quiz/submit', { method: 'POST', body: JSON.stringify(payload) }),
    report: (id) => request(`/quiz/${id}/report`),
    exportCsv: (id) => `${API_BASE_URL}${API_PREFIX}/quiz/${id}/export`,
  },

  economy: {
    coins: () => request('/coins'),
    addCoins: (coins) => request('/coins/add', { method: 'POST', body: JSON.stringify({ coins }) }),
  },

  achievements: {
    grant: (key) => request('/achievements/grant', { method: 'POST', body: JSON.stringify({ key }) }),
  },

  generate: {
    stream: (prompt, requestOptions = {}) => request('/generate/stream', { method: 'POST', body: JSON.stringify({ prompt }) }, { retries: 1, timeoutMs: 35000, ...requestOptions }),
  },
};

export default api;
