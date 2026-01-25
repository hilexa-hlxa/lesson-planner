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
  }
};

export default api;
