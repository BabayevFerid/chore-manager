// small API wrapper
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) {
    const err = (data && data.error) || (data && data.errors) || res.statusText;
    throw { status: res.status, message: err };
  }
  return data;
}

export const api = {
  // auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  // families
  createFamily: (payload) => request('/families', { method: 'POST', body: JSON.stringify(payload) }),
  joinFamily: (payload) => request('/families/join', { method: 'POST', body: JSON.stringify(payload) }),
  getFamily: (id) => request(`/families/${id}`),
  // chores
  createChore: (payload) => request('/chores', { method: 'POST', body: JSON.stringify(payload) }),
  listChores: (params = '') => request(`/chores${params}`),
  markDone: (id) => request(`/chores/${id}/done`, { method: 'POST' }),
  assignChore: (id, payload) => request(`/chores/${id}/assign`, { method: 'POST', body: JSON.stringify(payload) }),
  autoAssign: () => request('/chores/auto-assign', { method: 'POST' })
};

// simple token helpers
export function setToken(token) { localStorage.setItem('token', token); }
export function clearToken() { localStorage.removeItem('token'); }
export function getSavedToken() { return localStorage.getItem('token'); }
