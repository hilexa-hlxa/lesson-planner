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
  }

};

export default api;
