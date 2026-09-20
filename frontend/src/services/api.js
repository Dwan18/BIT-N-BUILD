/**
 * Dynamic API Client for SMART_STAGE
 * Connects directly to the Express backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('smart_stage_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// --- Auth & Session ---
export const authApi = {
  createEvent: (data) => request('/events', { method: 'POST', body: data }),
  joinEvent: (code, data) => request(`/events/${code}/join`, { method: 'POST', body: data }),
  getMe: () => request('/me'),
};

// --- Events ---
export const eventsApi = {
  list: () => request('/events'),
  get: (id) => request(`/events/${id}`),
  update: (id, data) => request(`/events/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  start: (id) => request(`/events/${id}/start`, { method: 'POST' }),
  end: (id) => request(`/events/${id}/end`, { method: 'POST' }),
};

// --- Activities & Agenda ---
export const activitiesApi = {
  create: (eventId, data) => request(`/events/${eventId}/activities`, { method: 'POST', body: data }),
  update: (id, data) => request(`/activities/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/activities/${id}`, { method: 'DELETE' }),
  reorder: (eventId, ordered_ids) => request(`/events/${eventId}/activities/reorder`, { method: 'POST', body: { ordered_ids } }),
  
  // Live control actions
  start: (id) => request(`/activities/${id}/start`, { method: 'POST' }),
  complete: (id) => request(`/activities/${id}/complete`, { method: 'POST' }),
  reportDelay: (id, delay_min, reason) => request(`/activities/${id}/delay`, { method: 'POST', body: { delay_min, reason } }),
  cancel: (id, reason) => request(`/activities/${id}/cancel`, { method: 'POST', body: { reason } }),
  postpone: (id, reason) => request(`/activities/${id}/postpone`, { method: 'POST', body: { reason } }),
  updateTiming: (id, timingData) => request(`/activities/${id}/timing`, { method: 'PATCH', body: timingData }),
  updateRoom: (id, room) => request(`/activities/${id}/room`, { method: 'PATCH', body: { room } }),
};

// --- People (Speakers, Jury, Team) ---
export const peopleApi = {
  list: (eventId, roleType) => request(`/events/${eventId}/people${roleType ? `?role_type=${roleType}` : ''}`),
  create: (eventId, data) => request(`/events/${eventId}/people`, { method: 'POST', body: data }),
  update: (id, data) => request(`/people/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/people/${id}`, { method: 'DELETE' }),
};

// --- Smart Script Studio & AI Engine ---
export const scriptsApi = {
  getEventScripts: (eventId) => request(`/events/${eventId}/scripts`),
  getActivityScripts: (activityId) => request(`/activities/${activityId}/scripts`),
  generate: (eventId, payload) => request(`/events/${eventId}/scripts/generate`, { method: 'POST', body: payload }),
  generateBatch: (eventId) => request(`/events/${eventId}/scripts/generate-batch`, { method: 'POST' }),
  regenerate: (scriptId, payload) => request(`/scripts/${scriptId}/regenerate`, { method: 'POST', body: payload }),
  editManual: (scriptId, payload) => request(`/scripts/${scriptId}`, { method: 'PUT', body: payload }),
};

// --- Real-time & Live State ---
export const liveApi = {
  getLiveState: (eventId) => request(`/events/${eventId}/live`),
  postAnnouncement: (eventId, message, severity) => request(`/events/${eventId}/announcements`, { method: 'POST', body: { message, severity } }),
  getUpdates: (eventId, since) => request(`/events/${eventId}/updates${since ? `?since=${since}` : ''}`),
  getStreamUrl: (eventId) => `${BASE_URL}/events/${eventId}/stream`,
};

export const dashboardApi = {
  getNotifications: async () => {
    try {
      const updates = await liveApi.getUpdates('evt_techfest2026');
      return (updates || []).map(u => ({
        id: u.id,
        title: u.message,
        time: new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      }));
    } catch {
      return [];
    }
  },
  markAllNotificationsRead: async () => ({ ok: true }),
};

