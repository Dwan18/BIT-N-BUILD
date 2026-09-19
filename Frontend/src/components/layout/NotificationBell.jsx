import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/format';

const DOT = { warning: 'bg-amber', success: 'bg-ok', info: 'bg-signal-400', error: 'bg-live' };

export default function NotificationBell() {
  const { notifications, unread, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-lg border border-ink-700 bg-ink-800 text-slate-300 hover:text-white"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-live px-1 text-[11px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-ink-600 bg-ink-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <button onClick={markAllRead} disabled={!unread} className="flex items-center gap-1 text-xs text-signal-400 hover:text-signal-300 disabled:text-slate-500">
              <CheckCheck size={14} /> Mark all read
            </button>
          </div>
          <ul className="scroll-thin max-h-80 divide-y divide-ink-700/60 overflow-y-auto">
            {notifications.length === 0 && <li className="p-6 text-center text-sm text-slate-400">You're all caught up.</li>}
            {notifications.map((n) => (
              <li key={n._id} className={`flex gap-3 px-4 py-3 ${n.read ? 'opacity-70' : ''}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[n.level] || DOT.info}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100">{n.title}</p>
                  <p className="text-sm text-slate-400">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-500">{timeAgo(n.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
