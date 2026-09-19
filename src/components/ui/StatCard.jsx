const TONES = {
  blue: 'bg-signal-500/15 text-signal-400',
  live: 'bg-live/15 text-live',
  ok: 'bg-ok/15 text-ok',
  amber: 'bg-amber/15 text-amber',
};

export default function StatCard({ icon: Icon, label, value, note, tone = 'blue', highlight = false }) {
  return (
    <div
      className={`panel p-4 ${highlight ? 'border-amber/40' : ''}`}
      role="group"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${TONES[tone]}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-slate-50">{value}</p>
      {note && <p className="mt-1 truncate text-xs text-slate-400">{note}</p>}
    </div>
  );
}
