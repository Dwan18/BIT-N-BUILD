import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dashboardApi } from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    dashboardApi.getNotifications(controller.signal).then(setItems).catch(() => {});
    return () => controller.abort();
  }, []);

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // level: 'success' | 'info' | 'warning' | 'error'
  const toast = useCallback(
    (message, level = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((t) => [...t, { id, message, level }]);
      setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast]
  );

  const markAllRead = useCallback(() => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    dashboardApi.markAllNotificationsRead().catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ notifications: items, unread: items.filter((n) => !n.read).length, markAllRead, toasts, toast, dismissToast }),
    [items, toasts, toast, markAllRead, dismissToast]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};
