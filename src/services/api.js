// Single place for backend calls. Point VITE_API_URL at your Express server.
// While VITE_USE_MOCK !== 'false', every call resolves with dummy data instead.
import { dashboardOverview, notifications } from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, { method = 'GET', body, signal } = {}) {
  const token = localStorage.getItem('token'); // swap for your auth strategy
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const message = (await res.json().catch(() => ({}))).message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

const mock = async (data, ms = 450) => {
  await wait(ms);
  return structuredClone(data);
};

export const dashboardApi = {
  // GET /api/dashboard/overview
  getOverview: (signal) =>
    USE_MOCK ? mock(dashboardOverview) : request('/dashboard/overview', { signal }),

  // GET /api/notifications
  getNotifications: (signal) =>
    USE_MOCK ? mock(notifications, 200) : request('/notifications', { signal }),

  // PATCH /api/notifications/read-all
  markAllNotificationsRead: () =>
    USE_MOCK ? mock({ ok: true }, 100) : request('/notifications/read-all', { method: 'PATCH' }),
};

export const eventsApi = {
  // POST /api/events
  create: (payload) => (USE_MOCK ? mock({ _id: 'evt_new', ...payload }, 300) : request('/events', { method: 'POST', body: payload })),
  // POST /api/events/:id/start
  startLive: (id) => (USE_MOCK ? mock({ _id: id, status: 'live' }, 300) : request(`/events/${id}/start`, { method: 'POST' })),
};

export const speakersApi = {
  // POST /api/speakers
  create: (payload) => (USE_MOCK ? mock({ _id: 'spk_new', ...payload }, 300) : request('/speakers', { method: 'POST', body: payload })),
};
