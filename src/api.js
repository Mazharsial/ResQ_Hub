import { AREAS, AREA_NAMES } from './geo.js';
import { can } from './core.js';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const SESSION_KEY = 'resq-session';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || `Service request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return body;
}

function saveSession(data) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ access: data.access, refresh: data.refresh }));
  return data.user;
}

function readSession() {
  const value = sessionStorage.getItem(SESSION_KEY);
  return value ? JSON.parse(value) : null;
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

async function authorizedRequest(path, options = {}) {
  let session = readSession();
  if (!session?.access) throw new Error('Your session has expired. Please sign in again.');
  const send = current => request(path, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${current.access}` },
  });
  try {
    return await send(session);
  } catch (error) {
    if (error.status !== 401 || !session.refresh) throw error;
    const refreshed = await request('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh: session.refresh }) });
    saveSession(refreshed);
    session = readSession();
    return send(session);
  }
}

export const api = {
  async login(email, password) {
    return saveSession(await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }));
  },
  async register({ name, email, role, password }) {
    const data = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, role, password }) });
    return data.pending ? data : saveSession(data);
  },
  async getSession() {
    const session = readSession();
    if (!session?.refresh) return null;
    try {
      return saveSession(await request('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh: session.refresh }) }));
    } catch (error) {
      if (error.status === 401) {
        clearSession();
        return null;
      }
      throw error;
    }
  },
  async logout() {
    const session = readSession();
    try {
      if (session?.refresh) await request('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refresh: session.refresh }) });
    } finally {
      clearSession();
    }
  },
  dashboard: () => request('/api/dashboard'),
  activity: () => request('/api/activity'),
  alerts: () => request('/api/alerts'),
  reports: () => authorizedRequest('/api/reports'),
  needs: () => request('/api/needs'),
  pledges: () => authorizedRequest('/api/pledges'),
  users: () => authorizedRequest('/api/users'),
  submitReport: report => authorizedRequest('/api/reports', { method: 'POST', body: JSON.stringify(report) }),
  createPledge: (needId, amount) => authorizedRequest('/api/pledges', { method: 'POST', body: JSON.stringify({ needId, amount }) }),
  advancePledge: id => authorizedRequest(`/api/pledges/${encodeURIComponent(id)}/advance`, { method: 'POST', body: '{}' }),
  moderateReport: (id, action) => authorizedRequest(`/api/reports/${encodeURIComponent(id)}/moderate`, { method: 'POST', body: JSON.stringify({ action }) }),
  approveUser: id => authorizedRequest(`/api/users/${encodeURIComponent(id)}/approve`, { method: 'POST', body: '{}' }),
  broadcast: alert => authorizedRequest('/api/alerts', { method: 'POST', body: JSON.stringify(alert) }),
  addNeed: need => authorizedRequest('/api/needs', { method: 'POST', body: JSON.stringify(need) }),
  async submitReport(user, report) {
    if (!can(user.role, 'report')) throw new Error('Your account cannot submit reports.');
    if (!report.pin) throw new Error('Choose a location on the map first.');
    if (report.img) throw new Error('Image uploads are not available yet. Remove the image and submit the written report.');
    return authorizedRequest('/api/reports', {
      method: 'POST',
      body: JSON.stringify({
        hazard: report.type,
        lat: report.pin.lat,
        lng: report.pin.lng,
        desc: report.desc,
        people: Number(report.people) || 0,
        district: report.area,
      }),
    });
  },
  async createPledge(user, needId, amount) {
    if (!can(user.role, 'pledge')) throw new Error('Only approved NGO accounts can pledge.');
    return authorizedRequest('/api/pledges', { method: 'POST', body: JSON.stringify({ needId, amount }) });
  },
  async advancePledge(user, id) {
    if (!can(user.role, 'delivery')) throw new Error('Your account cannot update delivery status.');
    return authorizedRequest(`/api/pledges/${encodeURIComponent(id)}/advance`, { method: 'POST', body: '{}' });
  },
  subscribeActivity(onEvent, onStatus) {
    let active = true;
    let pending = false;
    let initialized = false;
    const seen = new Set();
    const poll = async () => {
      if (pending) return;
      pending = true;
      try {
        const items = await request('/api/activity');
        if (!active) return;
        if (initialized) {
          items.filter(item => !seen.has(item.id)).reverse().forEach(onEvent);
        }
        items.forEach(item => seen.add(item.id));
        if (seen.size > 200) {
          seen.clear();
          items.forEach(item => seen.add(item.id));
        }
        initialized = true;
        onStatus('connected');
      } catch {
        if (active) onStatus('reconnecting');
      } finally {
        pending = false;
      }
    };
    void poll();
    const timer = setInterval(poll, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  },
};

export const DISTRICTS = AREAS;
export { AREAS, AREA_NAMES };
export const nearest = (lat, lng) => DISTRICTS.map(area => [area[0], (area[1] - lat) ** 2 + (area[2] - lng) ** 2]).sort((a, b) => a[1] - b[1])[0][0];
export const submitReport = (user, report) => api.submitReport(user, report);
