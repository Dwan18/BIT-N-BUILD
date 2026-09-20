import { CheckCircle2, Info, TriangleAlert, XCircle, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const LEVELS = {
  success: { icon: CheckCircle2, cls: 'text-ok' },
  info: { icon: Info, cls: 'text-signal-400' },
  warning: { icon: TriangleAlert, cls: 'text-amber' },
  error: { icon: XCircle, cls: 'text-live' },
};

export default function Toaster() {
  const { toasts, dismissToast } = useNotifications();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const { icon: Icon, cls } = LEVELS[t.level] || LEVELS.info;
        return (
          <div key={t.id} className="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-lg border border-ink-600 bg-ink-800 p-3 shadow-xl">
            <Icon size={18} className={`mt-0.5 shrink-0 ${cls}`} aria-hidden="true" />
            <p className="flex-1 text-sm text-slate-100">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="rounded p-0.5 text-slate-400 hover:text-white" aria-label="Dismiss notification">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
