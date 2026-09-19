import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import ProgressBar from '../ui/ProgressBar';
import Skeleton from '../ui/Skeleton';
import { formatDay, formatNumber } from '../../utils/format';

const columns = [
  {
    key: 'name',
    header: 'Event',
    render: (e) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-50">{e.name}</p>
        <p className="truncate text-xs text-slate-400">{e.venue}</p>
      </div>
    ),
  },
  { key: 'startDate', header: 'Date', className: 'whitespace-nowrap tabular-nums', render: (e) => formatDay(e.startDate) },
  { key: 'speakers', header: 'Speakers', hideBelow: 'md', className: 'tabular-nums' },
  {
    key: 'registrations',
    header: 'Registrations',
    hideBelow: 'sm',
    className: 'min-w-[150px]',
    render: (e) => {
      const pct = (e.registrations / e.capacity) * 100;
      return (
        <div>
          <p className="mb-1 text-xs tabular-nums text-slate-300">{formatNumber(e.registrations)} / {formatNumber(e.capacity)}</p>
          <ProgressBar value={pct} tone={pct > 85 ? 'amber' : 'signal'} label={`${e.name} registrations`} />
        </div>
      );
    },
  },
  { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} /> },
];

export default function UpcomingEvents({ events, loading }) {
  return (
    <Card
      title="Upcoming events"
      subtitle="Next five on the calendar"
      bodyClassName="p-0"
      action={<Link to="/events" className="text-sm font-medium text-signal-400 hover:text-signal-300">View all</Link>}
    >
      {loading ? (
        <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : (
        <DataTable columns={columns} rows={events} empty="No upcoming events. Create one to get started." />
      )}
    </Card>
  );
}
