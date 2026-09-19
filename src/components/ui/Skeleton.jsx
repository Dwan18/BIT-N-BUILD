export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-ink-700/60 ${className}`} aria-hidden="true" />;
}
