import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLiveState } from '../../hooks/useLiveState';
import { activitiesApi, peopleApi, liveApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  Play, 
  Check, 
  AlertTriangle, 
  Coffee, 
  MapPin, 
  Ban, 
  CalendarClock, 
  UserPlus, 
  Megaphone,
  Smartphone,
  Clock,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';

export default function CoordinatorBoard() {
  const { eventId, userName } = useAuth();
  const { liveState, refresh } = useLiveState(eventId);

  const [activeModal, setActiveModal] = useState(null); // 'DELAY' | 'BREAK' | 'ROOM' | 'CANCEL' | 'POSTPONE' | 'JURY' | 'ANNOUNCE'
  const [targetActId, setTargetActId] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [delayReason, setDelayReason] = useState('speaker in transit');
  const [newRoom, setNewRoom] = useState('Room C');
  const [juryName, setJuryName] = useState('');
  const [juryDesig, setJuryDesig] = useState('');
  const [announceMsg, setAnnounceMsg] = useState('');
  const [statusToast, setStatusToast] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const agenda = liveState?.agenda || [];
  const current = liveState?.current;
  const next = liveState?.next;
  const driftMin = liveState?.drift_min || 0;

  const showToast = (msg) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(''), 4000);
  };

  const handleStartCurrent = async (id) => {
    try {
      await activitiesApi.start(id);
      showToast('Session marked IN PROGRESS on stage');
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteCurrent = async (id) => {
    try {
      await activitiesApi.complete(id);
      showToast('Session completed! Flow advanced.');
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // 1. Submit Delay (The Demo Moment!)
  const handleSubmitDelay = async (e) => {
    e.preventDefault();
    if (!targetActId) return;
    setSubmitting(true);
    try {
      await activitiesApi.reportDelay(targetActId, Number(delayMinutes), delayReason);
      setActiveModal(null);
      showToast(`Reported ${delayMinutes}m delay. Downstream cascade recomputed!`);
      await refresh();
    } catch (err) {
      alert(err.message || 'Delay submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Submit Room Change
  const handleSubmitRoom = async (e) => {
    e.preventDefault();
    if (!targetActId) return;
    setSubmitting(true);
    try {
      await activitiesApi.updateRoom(targetActId, newRoom);
      setActiveModal(null);
      showToast(`Room updated to ${newRoom}. Anchor transition flagged.`);
      await refresh();
    } catch (err) {
      alert(err.message || 'Room update failed');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Extend Break
  const handleSubmitBreak = async (e) => {
    e.preventDefault();
    if (!targetActId) return;
    const act = agenda.find(a => a.id === targetActId);
    const newBreak = (act?.break_after_min || 0) + Number(delayMinutes);
    setSubmitting(true);
    try {
      await activitiesApi.updateTiming(targetActId, { break_after_min: newBreak });
      setActiveModal(null);
      showToast(`Break extended by ${delayMinutes} min.`);
      await refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Cancel
  const handleSubmitCancel = async (e) => {
    e.preventDefault();
    if (!targetActId) return;
    setSubmitting(true);
    try {
      await activitiesApi.cancel(targetActId, delayReason || 'Speaker absent');
      setActiveModal(null);
      showToast('Activity marked CANCELLED.');
      await refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Add Jury
  const handleSubmitJury = async (e) => {
    e.preventDefault();
    if (!juryName) return;
    setSubmitting(true);
    try {
      await peopleApi.create(eventId, {
        name: juryName,
        role_type: 'JURY',
        designation: juryDesig || 'Visiting Evaluator',
      });
      setActiveModal(null);
      setJuryName('');
      setJuryDesig('');
      showToast(`Added Jury: ${juryName}`);
      await refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Post Announcement
  const handleSubmitAnnounce = async (e) => {
    e.preventDefault();
    if (!announceMsg) return;
    setSubmitting(true);
    try {
      await liveApi.postAnnouncement(eventId, announceMsg, 'ATTENTION');
      setActiveModal(null);
      setAnnounceMsg('');
      showToast('Announcement broadcast to Stage & Audience');
      await refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      {/* Backstage Header Banner */}
      <div className="flex items-center justify-between bg-amber-500/10 border border-amber-300/60 rounded-xl p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
              Backstage Operations Board
            </span>
            <span className="text-xs text-amber-800">
              Coordinator: <strong className="text-slate-900">{userName}</strong>
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-500 block">Schedule Drift</span>
          <span className={`font-mono text-sm font-bold ${driftMin > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {driftMin > 0 ? `+${driftMin} min` : 'On Time'}
          </span>
        </div>
      </div>

      {/* Confirmation Toast */}
      {statusToast && (
        <div className="p-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-toast-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{statusToast}</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">Synced</span>
        </div>
      )}

      {/* Current Session - Big Thumb Controls */}
      <div className="panel p-5 bg-white border-2 border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            HAPPENING RIGHT NOW
          </span>
          {current && <StatusBadge status={current.status} />}
        </div>

        {current ? (
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-display mb-1">
              {current.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 flex-wrap">
              <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {current.computed_start} → {current.computed_end}
              </span>
              <span>•</span>
              <span>{current.person || 'Stage Flow'}</span>
              <span>•</span>
              <span>{current.room}</span>
            </div>

            {/* Big Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {current.status !== 'IN_PROGRESS' ? (
                <button
                  onClick={() => handleStartCurrent(current.id)}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md"
                >
                  <Play className="h-5 w-5 fill-white" />
                  <span>Start Session</span>
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
                  <span>ON AIR</span>
                </div>
              )}

              <button
                onClick={() => handleCompleteCurrent(current.id)}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md"
              >
                <Check className="h-5 w-5" />
                <span>Mark Complete</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            No active session running on stage right now.
          </div>
        )}
      </div>

      {/* Up Next Card */}
      {next && (
        <div className="panel p-4 bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              UP NEXT
            </span>
            <h4 className="text-sm font-bold text-slate-900">{next.title}</h4>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Scheduled {next.computed_start} · {next.person || 'Stage Flow'} · {next.room}
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400" />
        </div>
      )}

      {/* 2-Tap Action Grid (Section 3.2 Catalogue) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
          Backstage Reality Reporter (2-Tap Operations)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Action 1: Report Delay */}
          <button
            onClick={() => {
              setTargetActId(current?.id || agenda[0]?.id || '');
              setActiveModal('DELAY');
            }}
            className="panel p-4 bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
          >
            <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold mb-2 group-hover:bg-amber-100">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-800">
                Report Delay
              </span>
              <span className="text-[11px] text-slate-500">
                Set delay & cascade
              </span>
            </div>
          </button>

          {/* Action 2: Extend Break */}
          <button
            onClick={() => {
              setTargetActId(current?.id || agenda[0]?.id || '');
              setActiveModal('BREAK');
            }}
            className="panel p-4 bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
          >
            <div className="h-9 w-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold mb-2 group-hover:bg-teal-100">
              <Coffee className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-teal-800">
                Extend Break
              </span>
              <span className="text-[11px] text-slate-500">
                Add 5–15 min buffer
              </span>
            </div>
          </button>

          {/* Action 3: Change Room */}
          <button
            onClick={() => {
              const workshop = agenda.find(a => a.type === 'WORKSHOP') || next || agenda[0];
              setTargetActId(workshop?.id || '');
              setActiveModal('ROOM');
            }}
            className="panel p-4 bg-white border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
          >
            <div className="h-9 w-9 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold mb-2 group-hover:bg-sky-100">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-800">
                Change Room
              </span>
              <span className="text-[11px] text-slate-500">
                Move venue/room
              </span>
            </div>
          </button>

          {/* Action 4: Cancel Activity */}
          <button
            onClick={() => {
              setTargetActId(next?.id || agenda[0]?.id || '');
              setActiveModal('CANCEL');
            }}
            className="panel p-4 bg-white border border-slate-200 hover:border-red-400 hover:bg-red-50/50 text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
          >
            <div className="h-9 w-9 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-bold mb-2 group-hover:bg-red-100">
              <Ban className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-red-800">
                Cancel Session
              </span>
              <span className="text-[11px] text-slate-500">
                Speaker absent
              </span>
            </div>
          </button>

          {/* Action 5: Add Jury Member */}
          <button
            onClick={() => setActiveModal('JURY')}
            className="panel p-4 bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
          >
            <div className="h-9 w-9 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold mb-2 group-hover:bg-purple-100">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-purple-800">
                Add Jury
              </span>
              <span className="text-[11px] text-slate-500">
                Backstage check-in
              </span>
            </div>
          </button>

          {/* Action 6: Fast Announcement */}
          <button
            onClick={() => setActiveModal('ANNOUNCE')}
            className="panel p-4 bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
          >
            <div className="h-9 w-9 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold mb-2 group-hover:bg-rose-100">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-rose-800">
                Announcement
              </span>
              <span className="text-[11px] text-slate-500">
                Push urgent alert
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Modal: Report Delay (The Demo Moment!) */}
      {activeModal === 'DELAY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="panel p-5 bg-white w-full max-w-sm shadow-xl animate-toast-in">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Report Schedule Delay</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDelay} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delayed Session
                </label>
                <select
                  value={targetActId}
                  onChange={(e) => setTargetActId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:border-amber-500"
                  required
                >
                  {agenda.map(a => (
                    <option key={a.id} value={a.id}>
                      #{a.sequence} {a.title} ({a.planned_start})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delay Amount (Minutes)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5, 10, 15, 20].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDelayMinutes(m)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        delayMinutes === m
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{m}m
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason (Provided to AI for context)
                </label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white mb-1.5"
                >
                  <option value="speaker in transit">Speaker in transit / traffic</option>
                  <option value="audio-visual setup">Audio-visual / laptop setup</option>
                  <option value="previous session overrun">Previous session overrun</option>
                  <option value="guest arrival delayed">Chief guest arrival delayed</option>
                </select>
                <input
                  type="text"
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  placeholder="Or custom reason"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 shadow-sm"
                >
                  {submitting ? 'Applying...' : 'Apply & Cascade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Room */}
      {activeModal === 'ROOM' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="panel p-5 bg-white w-full max-w-sm shadow-xl animate-toast-in">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-600" />
                <span>Move Session to New Room</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRoom} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session
                </label>
                <select
                  value={targetActId}
                  onChange={(e) => setTargetActId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                  required
                >
                  {agenda.map(a => (
                    <option key={a.id} value={a.id}>
                      #{a.sequence} {a.title} (Currently: {a.room})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Room / Venue
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['Room B', 'Room C', 'Main Hall'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRoom(r)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        newRoom === r
                          ? 'bg-sky-600 text-white border-sky-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-700 shadow-sm"
                >
                  {submitting ? 'Updating...' : 'Confirm Room Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Jury */}
      {activeModal === 'JURY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="panel p-5 bg-white w-full max-w-sm shadow-xl animate-toast-in">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-purple-600" />
                <span>Add Arriving Jury Member</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitJury} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jury Member Name
                </label>
                <input
                  type="text"
                  value={juryName}
                  onChange={(e) => setJuryName(e.target.value)}
                  placeholder="e.g. Prof. Iyer"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Department
                </label>
                <input
                  type="text"
                  value={juryDesig}
                  onChange={(e) => setJuryDesig(e.target.value)}
                  placeholder="e.g. Dean of R&D"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 shadow-sm"
                >
                  Add Jury Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Announcement */}
      {activeModal === 'ANNOUNCE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="panel p-5 bg-white w-full max-w-sm shadow-xl animate-toast-in">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-rose-600" />
                <span>Post Stage Announcement</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAnnounce} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message for Anchor & Screens
                </label>
                <textarea
                  rows="3"
                  value={announceMsg}
                  onChange={(e) => setAnnounceMsg(e.target.value)}
                  placeholder="e.g. Parking on the north gate is now open."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
