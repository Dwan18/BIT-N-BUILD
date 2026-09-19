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
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, ListChecks, Megaphone, Radio, RefreshCw, ScrollText, TriangleAlert } from 'lucide-react';
import DesignationSelector from '../components/dashboard/DesignationSelector';

const fetchOverview = (signal) => dashboardApi.getOverview(signal);

export default function Dashboard() {
  const [designation, setDesignation] = useState(null);
  const { data, loading, error, refetch } = useApi(fetchOverview);
  const d = data || {};

  if (!designation) {
    return (
      <div className="space-y-6">
        <DesignationSelector onSelect={setDesignation} />
        <p className="text-center text-xs text-slate-500">Your selection only changes this frontend workspace view.</p>
      </div>
    );
  }

  const roleCopy = {
    organizer: { eyebrow: 'Organizer workspace', title: 'Control room', description: 'Plan events, shape the agenda, and keep every stage moving.' },
    coordinator: { eyebrow: 'Coordinator workspace', title: 'Live monitor', description: 'Watch the schedule and respond when the plan changes.' },
    anchor: { eyebrow: 'Anchor workspace', title: 'Live stage', description: 'See what is live, what is next, and the latest stage updates.' },
  }[designation];

  const roleActions = {
    organizer: [
      { label: 'Create event', to: '/events', icon: CalendarPlus },
      { label: 'Manage agenda', to: '/agenda', icon: ListChecks },
    ],
    coordinator: [
      { label: 'Open live control', to: '/live-control', icon: RefreshCw },
      { label: 'Send announcement', to: '/announcements', icon: Megaphone },
    ],
    anchor: [
      { label: 'Open live control', to: '/live-control', icon: Radio },
      { label: 'Open announcements', to: '/announcements', icon: ScrollText },
    ],
  }[designation];

  const roleActionsPanel = (
    <section className="panel p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Your next moves</p>
        <h2 className="mt-1 text-base font-semibold">{designation === 'organizer' ? 'Build the run of show' : designation === 'coordinator' ? 'Keep the room in sync' : 'Stay ready for the stage'}</h2>
      </div>
      <div className="mt-4 grid gap-2">
        {roleActions.map(({ label, to, icon: Icon }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850 p-3 text-sm font-semibold text-slate-100 transition hover:border-signal-500/60 hover:bg-ink-700/50">
            <Icon size={17} className="text-signal-300" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal-300">{roleCopy.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{roleCopy.title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading ? 'Loading your events…' : roleCopy.description}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button onClick={() => setDesignation(null)} className="h-9 rounded-lg border border-ink-600 bg-ink-800 px-3 text-sm text-slate-300 hover:border-signal-500/60">Change designation</button>
          <button onClick={refetch} className="flex h-9 items-center gap-2 rounded-lg border border-ink-600 bg-ink-800 px-3 text-sm text-slate-200 hover:border-signal-500/60"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh</button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-lg border border-live/30 bg-live/10 px-4 py-3 text-sm text-slate-100">
          <TriangleAlert size={18} className="shrink-0 text-live" />
          <p className="flex-1">Couldn't load dashboard data: {error.message}. Check that the API is running, then refresh.</p>
        </div>
      )}

      {designation === 'organizer' && <SummaryCards summary={d.summary} loading={loading} />}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><LiveEventStatus event={d.liveEvent} agenda={d.todayAgenda} loading={loading || !d.todayAgenda} /></div>
        {designation === 'organizer' ? <QuickActions /> : roleActionsPanel}

        {designation !== 'anchor' && <div className="xl:col-span-2"><UpcomingEvents events={d.upcomingEvents} loading={loading} /></div>}
        <div className="xl:row-span-2"><TodayAgenda sessions={d.todayAgenda} loading={loading} /></div>

        {designation === 'organizer' && <div className="xl:col-span-2"><AttendanceChart data={d.attendanceTrend} loading={loading} /></div>}

        {designation === 'organizer' && <SessionStatusChart data={d.sessionStatus} loading={loading} />}
        <div className={designation === 'organizer' ? 'xl:col-span-2' : 'xl:col-span-3'}><RecentActivity items={d.recentActivity} loading={loading} /></div>
      </div>
    </div>
  );
}
