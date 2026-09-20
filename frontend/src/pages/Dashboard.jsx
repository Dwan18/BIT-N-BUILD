import { useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, eventsApi } from '../services/api';
import useApi from '../hooks/useApi';
import { useNotifications } from '../context/NotificationContext';
import DesignationSelection from '../components/dashboard/DesignationSelection';
import SummaryCards from '../components/dashboard/SummaryCards';
import LiveEventStatus from '../components/dashboard/LiveEventStatus';
import QuickActions from '../components/dashboard/QuickActions';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import TodayAgenda from '../components/dashboard/TodayAgenda';
import AttendanceChart from '../components/dashboard/AttendanceChart';
import SessionStatusChart from '../components/dashboard/SessionStatusChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import { Activity, CalendarPlus, Check, ChevronLeft, ClipboardList, RefreshCw, TriangleAlert, X } from 'lucide-react';
import Card from '../components/ui/Card';

const fetchOverview = (signal) => dashboardApi.getOverview(signal);

export default function Dashboard() {
  const { data, loading, error, refetch } = useApi(fetchOverview);
  const { toast } = useNotifications();
  const [designation, setDesignation] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [addedActivities, setAddedActivities] = useState([]);
  const [eventForm, setEventForm] = useState({ name: '', date: '', time: '', venue: '', type: '', details: '' });
  const [activityForm, setActivityForm] = useState({ title: '', details: '' });
  const d = data || {};

  if (!designation) return <DesignationSelection onSelect={setDesignation} />;

  const isOrganizer = designation === 'organizer';
  const isStageManager = designation === 'stage-manager';
  const designationLabel = isOrganizer ? 'Event Organizer' : isStageManager ? 'Stage Manager' : 'Speaker';
  const roleSummary = isOrganizer
    ? 'Build the program, coordinate contributors and keep every event on track.'
    : isStageManager
      ? 'Stay ahead of the live schedule and keep every stage in sync.'
      : 'Keep your sessions prepared and your event-day details close at hand.';
  const events = [...createdEvents, ...(d.upcomingEvents || [])];
  const activities = [...addedActivities, ...(d.recentActivity || [])];

  const submitEvent = async (event) => {
    event.preventDefault();
    const payload = {
      name: eventForm.name,
      startDate: `${eventForm.date}T${eventForm.time || '09:00'}:00`,
      venue: eventForm.venue,
      eventType: eventForm.type,
      details: eventForm.details,
      status: 'draft',
      speakers: 0,
      registrations: 0,
      capacity: 0,
    };
    try {
      const created = await eventsApi.create(payload);
      setCreatedEvents((current) => [{ ...payload, ...created }, ...current]);
      setEventForm({ name: '', date: '', time: '', venue: '', type: '', details: '' });
      setActiveForm(null);
      toast('Event draft created', 'success');
    } catch (requestError) {
      toast(`Could not create event: ${requestError.message}`, 'error');
    }
  };

  const submitActivity = (event) => {
    event.preventDefault();
    setAddedActivities((current) => [{
      _id: `local-${Date.now()}`,
      type: 'activity',
      message: activityForm.title,
      actor: designationLabel,
      createdAt: new Date().toISOString(),
      details: activityForm.details,
    }, ...current]);
    setActivityForm({ title: '', details: '' });
    setActiveForm(null);
    toast('Activity added to this workspace', 'success');
  };

  const closeForm = () => setActiveForm(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-signal-400">
            <span>{designationLabel}</span>
            <span className="text-slate-600">/</span>
            <button type="button" onClick={() => setDesignation(null)} className="inline-flex items-center gap-1 text-slate-400 hover:text-white">
              <ChevronLeft size={13} /> Change designation
            </button>
          </div>
          <h1 className="text-2xl font-semibold md:text-3xl">{isStageManager ? 'Live control room' : isOrganizer ? 'Organizer dashboard' : 'Speaker dashboard'}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading ? 'Loading your events…' : roleSummary}
          </p>
        </div>
        <button type="button" onClick={refetch} className="flex h-9 items-center gap-2 rounded-lg border border-ink-600 bg-ink-800 px-3 text-sm text-slate-200 hover:border-signal-500/60">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-lg border border-live/30 bg-live/10 px-4 py-3 text-sm text-slate-100">
          <TriangleAlert size={18} className="shrink-0 text-live" />
          <p className="flex-1">Couldn't load dashboard data: {error.message}. Check that the API is running, then refresh.</p>
        </div>
      )}

      {(isOrganizer || isStageManager) && <SummaryCards summary={d.summary} loading={loading} />}

      <Card title="Workspace actions" subtitle={isOrganizer ? 'Set up the next event or manage your production team.' : isStageManager ? 'Keep the run of show current as the day changes.' : 'Capture preparation notes and review the schedule.'}>
        <div className="grid gap-3 md:grid-cols-2">
          {(isOrganizer || isStageManager) && (
            <button type="button" onClick={() => setActiveForm('event')} className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-850 p-4 text-left transition-colors hover:border-signal-500/60 hover:bg-ink-700/50">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-signal-500/15 text-signal-400"><CalendarPlus size={19} /></span>
              <span><span className="block font-semibold text-slate-50">Add event</span><span className="text-xs text-slate-400">Create a draft with dates, venue and agenda details</span></span>
            </button>
          )}
          {(isStageManager || designation === 'speaker') && (
            <button type="button" onClick={() => setActiveForm('activity')} className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-850 p-4 text-left transition-colors hover:border-ok/60 hover:bg-ink-700/50">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ok/15 text-ok"><Activity size={19} /></span>
              <span><span className="block font-semibold text-slate-50">Add activity</span><span className="text-xs text-slate-400">Record a task, note or event-day update</span></span>
            </button>
          )}
          <Link to="/agenda" className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-850 p-4 text-left transition-colors hover:border-signal-500/60 hover:bg-ink-700/50">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber/15 text-amber"><ClipboardList size={19} /></span>
            <span><span className="block font-semibold text-slate-50">Review agenda</span><span className="text-xs text-slate-400">Open the existing agenda management view</span></span>
          </Link>
        </div>
      </Card>

      {activeForm === 'event' && (
        <Card title="Add event" subtitle="Create a frontend draft using the existing events service." action={<button type="button" onClick={closeForm} aria-label="Close add event form" className="rounded-md p-1 text-slate-400 hover:bg-ink-700 hover:text-white"><X size={18} /></button>}>
          <form onSubmit={submitEvent} className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-300">Event name<input required value={eventForm.name} onChange={(event) => setEventForm({ ...eventForm, name: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-ink-600 bg-ink-850 px-3 text-slate-100" placeholder="e.g. Product Futures Conference" /></label>
            <label className="text-sm text-slate-300">Event type<input required value={eventForm.type} onChange={(event) => setEventForm({ ...eventForm, type: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-ink-600 bg-ink-850 px-3 text-slate-100" placeholder="Conference, workshop, summit" /></label>
            <label className="text-sm text-slate-300">Date<input required type="date" value={eventForm.date} onChange={(event) => setEventForm({ ...eventForm, date: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-ink-600 bg-ink-850 px-3 text-slate-100" /></label>
            <label className="text-sm text-slate-300">Time<input required type="time" value={eventForm.time} onChange={(event) => setEventForm({ ...eventForm, time: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-ink-600 bg-ink-850 px-3 text-slate-100" /></label>
            <label className="text-sm text-slate-300 md:col-span-2">Venue<input required value={eventForm.venue} onChange={(event) => setEventForm({ ...eventForm, venue: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-ink-600 bg-ink-850 px-3 text-slate-100" placeholder="Venue or streaming location" /></label>
            <label className="text-sm text-slate-300 md:col-span-2">Agenda and details<textarea required rows="3" value={eventForm.details} onChange={(event) => setEventForm({ ...eventForm, details: event.target.value })} className="mt-1.5 w-full rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-slate-100" placeholder="Add the short agenda, goals or production notes" /></label>
            <div className="flex justify-end gap-2 md:col-span-2"><button type="button" onClick={closeForm} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-signal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-signal-500"><Check size={16} /> Create draft</button></div>
          </form>
        </Card>
      )}

      {activeForm === 'activity' && (
        <Card title="Add activity" subtitle="This note stays in the current frontend workspace." action={<button type="button" onClick={closeForm} aria-label="Close add activity form" className="rounded-md p-1 text-slate-400 hover:bg-ink-700 hover:text-white"><X size={18} /></button>}>
          <form onSubmit={submitActivity} className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-300">Activity title<input required value={activityForm.title} onChange={(event) => setActivityForm({ ...activityForm, title: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-ink-600 bg-ink-850 px-3 text-slate-100" placeholder="e.g. Confirmed stage rehearsal" /></label>
            <label className="text-sm text-slate-300">Details<input value={activityForm.details} onChange={(event) => setActivityForm({ ...activityForm, details: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-ink-600 bg-ink-850 px-3 text-slate-100" placeholder="Optional note" /></label>
            <div className="flex justify-end md:col-span-2"><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-ok px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-emerald-300"><Check size={16} /> Add activity</button></div>
          </form>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {(isOrganizer || isStageManager) && <div className="xl:col-span-2"><LiveEventStatus event={d.liveEvent} agenda={d.todayAgenda} loading={loading || !d.todayAgenda} /></div>}
        <QuickActions designation={designation} />

        {(isOrganizer || isStageManager) && <div className="xl:col-span-2"><UpcomingEvents events={events} loading={loading} /></div>}
        <div className="xl:row-span-2"><TodayAgenda sessions={d.todayAgenda || []} loading={loading} /></div>

        {isOrganizer && <div className="xl:col-span-2"><AttendanceChart data={d.attendanceTrend} loading={loading} /></div>}

        {(isOrganizer || isStageManager) && <SessionStatusChart data={d.sessionStatus} loading={loading} />}
        <div className="xl:col-span-2"><RecentActivity items={activities} loading={loading} /></div>
      </div>
    </div>
  );
}
