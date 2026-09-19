const STYLES = {
  live: { cls: 'bg-live/15 text-live ring-live/30', label: 'Live', dot: true },
  upcoming: { cls: 'bg-signal-500/15 text-signal-300 ring-signal-500/30', label: 'Upcoming' },
  scheduled: { cls: 'bg-slate-400/10 text-slate-300 ring-slate-400/20', label: 'Scheduled' },
  completed: { cls: 'bg-ok/15 text-ok ring-ok/30', label: 'Completed' },
  delayed: { cls: 'bg-amber/15 text-amber ring-amber/30', label: 'Delayed' },
  draft: { cls: 'bg-slate-500/10 text-slate-400 ring-slate-500/25', label: 'Draft' },
  cancelled: { cls: 'bg-live/10 text-live ring-live/25', label: 'Cancelled' },
};

export default function StatusBadge({ status, label, className = '' }) {
  const s = STYLES[status] || STYLES.scheduled;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls} ${className}`}
    >
      {s.dot && <LiveDot size="sm" />}
      {label || s.label}
    </span>
  );
}

// Pulsing indicator used for anything that is on air right now.
export function LiveDot({ size = 'md' }) {
  const dim = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5';
  return (
    <span className={`relative inline-flex ${dim}`} aria-hidden="true">
      <span className="absolute inset-0 animate-live-ring rounded-full bg-live" />
      <span className="relative inline-flex h-full w-full rounded-full bg-live" />
    </span>
  );
}
