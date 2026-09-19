import { dashboardApi } from '../services/api';
import useApi from '../hooks/useApi';
import SummaryCards from '../components/dashboard/SummaryCards';
import LiveEventStatus from '../components/dashboard/LiveEventStatus';
import QuickActions from '../components/dashboard/QuickActions';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import TodayAgenda from '../components/dashboard/TodayAgenda';
import AttendanceChart from '../components/dashboard/AttendanceChart';
import SessionStatusChart from '../components/dashboard/SessionStatusChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import { RefreshCw, TriangleAlert } from 'lucide-react';

const fetchOverview = (signal) => dashboardApi.getOverview(signal);

export default function Dashboard() {
  const { data, loading, error, refetch } = useApi(fetchOverview);
  const d = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Control room</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading ? 'Loading your events…' : `${d.liveEvent?.name} is on air. ${d.summary?.delayedSessions.value} sessions are running late.`}
          </p>
        </div>
        <button onClick={refetch} className="flex h-9 items-center gap-2 rounded-lg border border-ink-600 bg-ink-800 px-3 text-sm text-slate-200 hover:border-signal-500/60">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-lg border border-live/30 bg-live/10 px-4 py-3 text-sm text-slate-100">
          <TriangleAlert size={18} className="shrink-0 text-live" />
          <p className="flex-1">Couldn't load dashboard data: {error.message}. Check that the API is running, then refresh.</p>
        </div>
      )}

      <SummaryCards summary={d.summary} loading={loading} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><LiveEventStatus event={d.liveEvent} agenda={d.todayAgenda} loading={loading || !d.todayAgenda} /></div>
        <QuickActions />

        <div className="xl:col-span-2"><UpcomingEvents events={d.upcomingEvents} loading={loading} /></div>
        <div className="xl:row-span-2"><TodayAgenda sessions={d.todayAgenda} loading={loading} /></div>

        <div className="xl:col-span-2"><AttendanceChart data={d.attendanceTrend} loading={loading} /></div>

        <SessionStatusChart data={d.sessionStatus} loading={loading} />
        <div className="xl:col-span-2"><RecentActivity items={d.recentActivity} loading={loading} /></div>
      </div>
    </div>
  );
}
