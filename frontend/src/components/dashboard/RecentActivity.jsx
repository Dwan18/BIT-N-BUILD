import { TimerReset, Mic, Megaphone, Sparkles, CalendarCheck, Radio } from 'lucide-react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import { timeAgo } from '../../utils/format';

const TYPES = {
  delay: { icon: TimerReset, cls: 'bg-amber/15 text-amber' },
  speaker: { icon: Mic, cls: 'bg-ok/15 text-ok' },
  announcement: { icon: Megaphone, cls: 'bg-signal-500/15 text-signal-400' },
  ai: { icon: Sparkles, cls: 'bg-violet-400/15 text-violet-300' },
  event: { icon: CalendarCheck, cls: 'bg-signal-500/15 text-signal-400' },
  live: { icon: Radio, cls: 'bg-live/15 text-live' },
};

export default function RecentActivity({ items, loading }) {
  return (
    <Card title="Recent activity" subtitle="Changes across your events" bodyClassName="p-0">
      {loading ? (
        <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : (
        <ul className="divide-y divide-ink-700/50">
          {items.map((a) => {
            const { icon: Icon, cls } = TYPES[a.type] || TYPES.event;
            return (
              <li key={a._id} className="flex items-center gap-3 px-5 py-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${cls}`}>
                  <Icon size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-100">{a.message}</p>
                  <p className="text-xs text-slate-400">{a.actor}</p>
                </div>
                <time className="shrink-0 text-xs text-slate-500" dateTime={a.createdAt}>{timeAgo(a.createdAt)}</time>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
