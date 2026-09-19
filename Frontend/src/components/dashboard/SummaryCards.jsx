import { CalendarRange, CalendarClock, Radio, CheckCircle2, TimerReset } from 'lucide-react';
import StatCard from '../ui/StatCard';
import Skeleton from '../ui/Skeleton';

export default function SummaryCards({ summary, loading }) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[124px]" />)}
      </div>
    );
  }

  const cards = [
    { key: 'totalEvents', label: 'Total events', icon: CalendarRange, tone: 'blue' },
    { key: 'upcomingEvents', label: 'Upcoming events', icon: CalendarClock, tone: 'blue' },
    { key: 'liveEvents', label: 'Live events', icon: Radio, tone: 'live' },
    { key: 'completedEvents', label: 'Completed events', icon: CheckCircle2, tone: 'ok' },
    { key: 'delayedSessions', label: 'Delayed sessions', icon: TimerReset, tone: 'amber', highlight: true },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {cards.map(({ key, ...rest }) => (
        <StatCard key={key} value={summary[key].value} note={summary[key].change} {...rest} />
      ))}
    </div>
  );
}
