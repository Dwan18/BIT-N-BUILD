export default function StatusBadge({ status, className = '' }) {
  const s = (status || 'SCHEDULED').toUpperCase();

  const styles = {
    SCHEDULED: 'bg-slate-100 text-slate-700 border-slate-200',
    UPCOMING: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-400/20',
    IN_PROGRESS: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20 font-semibold',
    LIVE: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold animate-pulse',
    DELAYED: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    COMPLETED: 'bg-slate-100 text-slate-500 border-slate-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200 line-through',
    POSTPONED: 'bg-purple-50 text-purple-700 border-purple-200',
    READY: 'bg-teal-50 text-teal-700 border-teal-200',
    DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const currentStyle = styles[s] || styles.SCHEDULED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} ${className}`}
    >
      {s === 'IN_PROGRESS' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
      {s === 'DELAYED' && <span>⚠️</span>}
      {s.replace('_', ' ')}
    </span>
  );
}
