import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLiveState } from '../../hooks/useLiveState';
import { eventsApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  Play, 
  Square, 
  Sparkles, 
  CalendarDays, 
  Users, 
  Mic, 
  Smartphone, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { eventId, eventData, refreshEvent } = useAuth();
  const { liveState, refresh } = useLiveState(eventId);

  const [actionLoading, setActionLoading] = useState(false);

  const event = liveState?.event || eventData;
  const agenda = liveState?.agenda || [];
  const updates = liveState?.recent_updates || [];
  const driftMin = liveState?.drift_min ?? 0;

  // Readiness checklist calculations
  const hasAgenda = agenda.length > 0;
  const hasPeople = agenda.some(a => a.person_id || a.person);
  const isLive = event?.status === 'LIVE';

  const handleStartLive = async () => {
    if (!confirm('Ready to start the live event? This will set status to LIVE and broadcast to the Anchor stage.')) return;
    setActionLoading(true);
    try {
      await eventsApi.start(eventId);
      await refreshEvent();
      await refresh();
    } catch (err) {
      alert(err.message || 'Failed to start event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndLive = async () => {
    if (!confirm('Are you sure you want to conclude the live event?')) return;
    setActionLoading(true);
    try {
      await eventsApi.end(eventId);
      await refreshEvent();
      await refresh();
    } catch (err) {
      alert(err.message || 'Failed to end event');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Event Control Card */}
      <div className="panel p-6 bg-white border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-900 font-display">
                {event?.name || 'TechFest 2026'}
              </h1>
              <StatusBadge status={event?.status} />
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Code: {event?.code || 'TF2026'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {event?.venue || 'Main Auditorium'} · Date: {event?.date || 'Today'} · Organizer PIN: <strong>{event?.organizer_pin || '1234'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isLive ? (
              <button
                onClick={handleEndLive}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <Square className="h-4 w-4" />
                <span>End Live Event</span>
              </button>
            ) : (
              <button
                onClick={handleStartLive}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 animate-pulse"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>START LIVE EVENT</span>
              </button>
            )}

            <button
              onClick={() => navigate('/organizer/scripts')}
              className="flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>AI Script Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel p-4 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Agenda</span>
            <CalendarDays className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {agenda.length} <span className="text-xs font-normal text-slate-500">Sessions</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Planned sequence active
          </div>
        </div>

        <div className="panel p-4 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Speakers & Guests</span>
            <Users className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {agenda.filter(a => a.person).length} <span className="text-xs font-normal text-slate-500">Assigned</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Grounded speaker profiles
          </div>
        </div>

        <div className="panel p-4 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Schedule Drift</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className={`text-2xl font-black font-display ${driftMin > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {driftMin > 0 ? `+${driftMin} min` : 'On Schedule'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Live cascade delta
          </div>
        </div>

        <div className="panel p-4 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stage Status</span>
            <Activity className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-base font-bold text-slate-900 truncate">
            {liveState?.current ? liveState.current.title : 'Ready to Start'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {liveState?.current ? `At ${liveState.current.computed_start}` : 'Standing by'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Readiness & Quick Links + Live Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col): Readiness Checklist & Share Links */}
        <div className="space-y-6">
          {/* Readiness Checklist */}
          <div className="panel p-5 bg-white">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              <span>Event Readiness Checklist</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <CheckCircle2 className={`h-4 w-4 mt-0.5 ${hasAgenda ? 'text-emerald-600' : 'text-slate-300'}`} />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">Agenda & Timing Defined</span>
                  <span className="text-slate-500">{agenda.length} sessions with cascade timings computed</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <CheckCircle2 className={`h-4 w-4 mt-0.5 ${hasPeople ? 'text-emerald-600' : 'text-slate-300'}`} />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">Keynote & Speakers Grounded</span>
                  <span className="text-slate-500">Profiles loaded (Dr. Mehta, Ms. Patel, Prof. Shah)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">AI Script Studio Ready</span>
                  <span className="text-slate-500">Pre-generated opening, intros, transitions, closing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Share / Join Links */}
          <div className="panel p-5 bg-white">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Role Access & Links
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Team members can join instantly with the 6-character code <strong>{event?.code || 'TF2026'}</strong>.
            </p>

            <div className="space-y-2">
              <div 
                onClick={() => navigate('/coordinator')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <Smartphone className="h-4 w-4 text-amber-600" />
                  <span>Open Coordinator Mobile Board</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              <div 
                onClick={() => navigate('/anchor')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <Mic className="h-4 w-4 text-rose-600" />
                  <span>Open Anchor Stage Teleprompter</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2 cols): Live Agenda Overview & Updates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agenda Table */}
          <div className="panel p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Live Stage Flow
                </h3>
                <p className="text-xs text-slate-500">
                  Sessions ordered by sequence with recomputed times
                </p>
              </div>
              <button
                onClick={() => navigate('/organizer/agenda')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>Edit Agenda</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2.5 font-semibold">#</th>
                    <th className="pb-2.5 font-semibold">Session</th>
                    <th className="pb-2.5 font-semibold">Planned</th>
                    <th className="pb-2.5 font-semibold">Computed</th>
                    <th className="pb-2.5 font-semibold">Speaker / Room</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agenda.map((act) => {
                    const isDelayed = (act.delay_min || 0) > 0;
                    return (
                      <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 font-mono text-slate-400 font-bold">{act.sequence}</td>
                        <td className="py-2.5">
                          <span className="font-semibold text-slate-900 block">{act.title}</span>
                          <span className="text-[10px] text-slate-500">{act.duration_min} min session</span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-600">
                          {act.planned_start}
                        </td>
                        <td className="py-2.5 font-mono font-bold">
                          {isDelayed ? (
                            <span className="text-amber-700 flex items-center gap-1">
                              <span className="line-through text-slate-400 font-normal text-[11px]">{act.planned_start}</span>
                              <span>{act.computed_start}</span>
                            </span>
                          ) : (
                            <span className="text-slate-800">{act.computed_start}</span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-600">
                          <div>{act.person_name || '—'}</div>
                          <div className="text-[10px] text-slate-400">{act.room}</div>
                        </td>
                        <td className="py-2.5">
                          <StatusBadge status={act.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Update Feed */}
          <div className="panel p-5 bg-white">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Chronological Operations Log
            </h3>
            <div className="space-y-2.5">
              {updates.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center">No updates reported yet</div>
              ) : (
                updates.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-mono text-[11px] text-slate-400 mt-0.5">
                      {new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-800 block">{u.message}</span>
                      {u.reason && <span className="text-slate-500 text-[11px]">Reason: {u.reason}</span>}
                    </div>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {u.created_by}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
