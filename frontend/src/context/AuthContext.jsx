import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, eventsApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('smart_stage_role') || 'ORGANIZER');
  const [eventId, setEventId] = useState(() => localStorage.getItem('smart_stage_event_id') || 'evt_techfest2026');
  const [userName, setUserName] = useState(() => localStorage.getItem('smart_stage_user_name') || 'Aarav (Lead Organizer)');
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch event details whenever eventId changes
  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const data = await eventsApi.get(eventId);
        setEventData(data);
      } catch (err) {
        console.warn('Could not fetch active event, checking defaults:', err.message);
        // Fallback list
        try {
          const list = await eventsApi.list();
          if (list && list.length > 0) {
            setEventId(list[0].id);
            const full = await eventsApi.get(list[0].id);
            setEventData(full);
          }
        } catch (e) {
          console.error('Events list failed:', e.message);
        }
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);

  const switchRole = (newRole) => {
    const norm = newRole.toUpperCase();
    setRole(norm);
    localStorage.setItem('smart_stage_role', norm);
    if (norm === 'ORGANIZER') setUserName('Aarav (Lead Organizer)');
    else if (norm === 'COORDINATOR') setUserName('Rahul (Stage Coordinator)');
    else if (norm === 'ANCHOR') setUserName('Priya (Master of Ceremonies)');
  };

  const selectEvent = (id) => {
    setEventId(id);
    localStorage.setItem('smart_stage_event_id', id);
  };

  const joinEvent = async (code, joinRole, name, pin) => {
    const res = await authApi.joinEvent(code, { role: joinRole, name, pin });
    if (res.token) {
      localStorage.setItem('smart_stage_token', res.token);
    }
    setRole(res.role || joinRole.toUpperCase());
    setUserName(res.name || name);
    if (res.event?.id) {
      setEventId(res.event.id);
      setEventData(res.event);
      localStorage.setItem('smart_stage_event_id', res.event.id);
    }
    return res;
  };

  const refreshEvent = async () => {
    try {
      const data = await eventsApi.get(eventId);
      setEventData(data);
    } catch (err) {
      console.error('Refresh event failed:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        eventId,
        userName,
        eventData,
        loading,
        switchRole,
        selectEvent,
        joinEvent,
        refreshEvent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
