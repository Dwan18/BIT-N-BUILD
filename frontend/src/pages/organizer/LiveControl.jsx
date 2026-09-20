import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLiveState } from '../../hooks/useLiveState';
import { liveApi, activitiesApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  SlidersHorizontal, 
  Megaphone, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send,
  Play,
  Check
} from 'lucide-react';

export default function LiveControl() {
  const { eventId } = useAuth();
  const { liveState, refresh } = useLiveState(eventId);

  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [severity, setSeverity] = useState('INFO');
  const [posting, setPosting] = useState(false);

  const agenda = liveState?.agenda || [];
  const updates = liveState?.recent_updates || [];

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementMsg.trim()) return;
    setPosting(true);
    try {
      await liveApi.postAnnouncement(eventId, announcementMsg.trim(), severity);
      setAnnouncementMsg('');
      await refresh();
    } catch (err) {
      alert(err.message || 'Failed to post announcement');
    } finally {
      setPosting(false);
    }
  };

  const handleStartAct = async (id) => {
    try {
      await activitiesApi.start(id);
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteAct = async (id) => {
    try {
      await activitiesApi.complete(id);
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-display">Live Stage Control</h1>
        <p className="text-xs text-slate-500">
          Organizer mirror and structural live overrides. Changes broadcast immediately to coordinator phones and anchor lecterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Announcement Dispatcher */}
        <div className="space-y-6">
          <div className="panel p-5 bg-white border-t-4 border-t-teal-600">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-teal-600" />
              <span>Broadcast Live Announcement</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sends an instant notification badge to the anchor teleprompter and coordinator feed.
            </p>

            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:border-teal-500 font-semibold"
                >
                  <option value="INFO">ℹ️ General Info</option>
                  <option value="ATTENTION">⚠️ Attention / Action Needed</option>
                  <option value="EMERGENCY">🚨 Urgent / Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Message
                </label>
                <textarea
                  rows="3"
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="e.g. Parking on the north gate is now open, or lunch is served in foyer."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-teal-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={posting}
                className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-teal-600 py-2 text-xs font-bold text-white hover:bg-teal-700 shadow-sm disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{posting ? 'Broadcasting...' : 'Broadcast to Stage & Staff'}</span>
              </button>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="panel p-5 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Current Live Status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Live Stage Item:</span>
                <span className="font-bold text-slate-900">{liveState?.current?.title || 'None active'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Current Drift:</span>
                <span className="font-bold text-amber-700">+{liveState?.drift_min || 0} min</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Speaking Window:</span>
                <span className="font-mono font-bold text-teal-700">{liveState?.gap_to_next_sec || 60}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Agenda Flow & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-5 bg-white">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Real-Time Stage Progression
            </h3>

            <div className="space-y-3">
              {agenda.map((act) => {
                const isCurrent = liveState?.current?.id === act.id;
                return (
                  <div
                    key={act.id}
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-emerald-300 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{act.sequence}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-900 text-sm">
                            {act.title}
                          </span>
                          <StatusBadge status={act.status} />
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="font-mono font-medium text-slate-700">{act.computed_start} → {act.computed_end}</span>
                          <span>•</span>
                          <span>{act.person_name || 'No speaker'}</span>
                          <span>•</span>
                          <span>{act.room}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {act.status !== 'IN_PROGRESS' && act.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleStartAct(act.id)}
                          className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
                        >
                          <Play className="h-3 w-3 fill-white" />
                          <span>Start</span>
                        </button>
                      )}

                      {act.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleCompleteAct(act.id)}
                          className="flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 shadow-sm"
                        >
                          <Check className="h-3 w-3" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit updates list */}
          <div className="panel p-5 bg-white">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Full Update Stream (Append-Only Audit)
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto scroll-thin">
              {updates.map((u) => (
                <div key={u.id} className="p-2.5 rounded border border-slate-100 bg-slate-50 text-xs flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-slate-800 block">{u.message}</span>
                    {u.reason && <span className="text-[11px] text-slate-500">Reason: {u.reason}</span>}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(u.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
