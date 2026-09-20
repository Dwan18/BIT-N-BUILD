import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import Skeleton from '../ui/Skeleton';
import { formatTime } from '../../utils/format';

const RAIL = { completed: 'bg-ok', live: 'bg-live', delayed: 'bg-amber', scheduled: 'bg-ink-500' };

export default function TodayAgenda({ sessions, loading }) {
  return (
    <Card
      title="Today's agenda"
      subtitle={loading ? undefined : `${sessions.length} sessions across 2 stages`}
      className="h-full"
      action={<Link to="/agenda" className="text-sm font-medium text-signal-400 hover:text-signal-300">Manage</Link>}
    >
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <ol className="space-y-4">
          {sessions.map((s) => (
            <li key={s._id} className="flex gap-3">
              <div className="w-[68px] shrink-0 pt-0.5 text-right">
                <p className="text-sm font-medium tabular-nums text-slate-100">{formatTime(s.startTime)}</p>
                <p className="text-xs tabular-nums text-slate-500">{formatTime(s.endTime)}</p>
              </div>
              <span className={`w-1 shrink-0 rounded-full ${RAIL[s.status]}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${s.status === 'completed' ? 'text-slate-400' : 'text-slate-50'}`}>{s.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{s.speaker} · {s.stage}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={s.status} />
                  {s.delayMinutes > 0 && <span className="text-xs text-amber">+{s.delayMinutes} min</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
