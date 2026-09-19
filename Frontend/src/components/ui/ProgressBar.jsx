export default function ProgressBar({ value, tone = 'signal', label }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = { signal: 'bg-signal-500', live: 'bg-live', amber: 'bg-amber', ok: 'bg-ok' }[tone];
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-ink-950/70"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`h-full rounded-full transition-[width] duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
