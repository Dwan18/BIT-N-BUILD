import { Link } from 'react-router-dom';
import { Users, MonitorPlay, Mic2, Clock3, TriangleAlert, Radio } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import Skeleton from '../ui/Skeleton';
import { LiveDot } from '../ui/StatusBadge';
import useNow from '../../hooks/useNow';
import { formatNumber, formatTime } from '../../utils/format';

const STEP_STYLE = {
  completed: 'bg-ok',
  live: 'bg-live',
  delayed: 'bg-amber',
  scheduled: 'bg-ink-500',
};

export default function LiveEventStatus({ event, agenda, loading }) {
  const now = useNow(15000);

  if (loading || !event) return <Skeleton className="h-[340px]" />;

  const current = agenda.find((s) => s._id === event.currentSessionId);
  const next = agenda.find((s) => s._id === event.nextSessionId);
  const start = current ? new Date(current.startTime).getTime() : 0;
  const end = current ? new Date(current.endTime).getTime() : 0;
  const progress = current ? ((now - start) / (end - start)) * 100 : 0;
  const minsLeft = current ? Math.max(0, Math.round((end - now) / 60000)) : 0;

  const stats = [
    { icon: Users, label: 'Online now', value: formatNumber(event.attendeesOnline) },
    { icon: MonitorPlay, label: 'In the room', value: formatNumber(event.attendeesInRoom) },
    { icon: Radio, label: 'Stages live', value: event.stagesLive },
    { icon: Mic2, label: 'Anchor', value: event.anchor },
  ];

  return (
    <Card
      title="Live event status"
      className="border-live/25"
      action={
        <span className="flex items-center gap-2 rounded-full bg-live/15 px-3 py-1 text-xs font-semibold text-live ring-1 ring-inset ring-live/30">
          <LiveDot size="sm" /> On air
        </span>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <p className="font-display text-xl font-semibold text-white">{event.name}</p>
          <p className="text-sm text-slate-400">{event.venue}</p>

          {current && (
            <div className="mt-5 rounded-xl border border-ink-600 bg-ink-850 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Now on stage</p>
                  <p className="mt-0.5 truncate font-medium text-slate-50">{current.title}</p>
                  <p className="text-sm text-slate-400">{current.speaker}</p>
                </div>
                <p className="shrink-0 text-right">
                  <span className="font-display text-2xl font-semibold tabular-nums text-white">{minsLeft}</span>
                  <span className="ml-1 text-sm text-slate-400">min left</span>
                </p>
              </div>
              <div className="mt-4">
                <ProgressBar value={progress} tone="live" label="Current session progress" />
                <div className="mt-1.5 flex justify-between text-xs tabular-nums text-slate-400">
                  <span>{formatTime(current.startTime)}</span>
                  <span>{formatTime(current.endTime)}</span>
                </div>
              </div>
            </div>
          )}

          {next && (
            <div className="mt-3 flex items-center gap-3 rounded-lg bg-amber/10 px-3 py-2.5 text-sm ring-1 ring-inset ring-amber/25">
              {next.delayMinutes > 0 ? <TriangleAlert size={16} className="shrink-0 text-amber" /> : <Clock3 size={16} className="shrink-0 text-signal-400" />}
              <p className="min-w-0 truncate text-slate-200">
                <span className="text-slate-400">Up next: </span>{next.title}
              </p>
              <span className="ml-auto shrink-0 tabular-nums text-slate-300">
                {formatTime(next.startTime)}
                {next.delayMinutes > 0 && <span className="ml-1 text-amber">(+{next.delayMinutes} min)</span>}
              </span>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg bg-ink-850 p-3">
                <dt className="flex items-center gap-1.5 text-xs text-slate-400"><Icon size={14} aria-hidden="true" />{label}</dt>
                <dd className="mt-1 truncate font-display text-lg font-semibold text-slate-50">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Stage flow: one segment per session in today's run */}
          <div className="mt-5">
            <p className="mb-2 text-xs text-slate-400">Today's stage flow</p>
            <ol className="flex gap-1.5" aria-label="Session order">
              {agenda.map((s) => (
                <li key={s._id} className="flex-1" title={`${s.title} (${s.status})`}>
                  <div className={`h-2.5 rounded-full ${STEP_STYLE[s.status]} ${s.status === 'live' ? 'ring-2 ring-live/40' : ''}`} />
                </li>
              ))}
            </ol>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              {[['completed', 'Done'], ['live', 'Live'], ['delayed', 'Delayed'], ['scheduled', 'Scheduled']].map(([status, label]) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${STEP_STYLE[status]}`} />{label}
                </span>
              ))}
            </div>
          </div>

          <Link to="/live-control" className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-signal-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-signal-500">
            <Radio size={16} /> Open live control
          </Link>
        </div>
      </div>
    </Card>
  );
}
