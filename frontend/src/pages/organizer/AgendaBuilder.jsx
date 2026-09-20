import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLiveState } from '../../hooks/useLiveState';
import { activitiesApi, peopleApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  MapPin, 
  User, 
  Sparkles,
  Check,
  X
} from 'lucide-react';

export default function AgendaBuilder() {
  const { eventId } = useAuth();
  const { liveState, refresh } = useLiveState(eventId);

  const [people, setPeople] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState('TALK');
  const [plannedStart, setPlannedStart] = useState('10:00');
  const [durationMin, setDurationMin] = useState(30);
  const [breakAfterMin, setBreakAfterMin] = useState(0);
  const [room, setRoom] = useState('Main Auditorium');
  const [personId, setPersonId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const agenda = liveState?.agenda || [];

  useEffect(() => {
    if (eventId) {
      peopleApi.list(eventId).then(setPeople).catch(console.error);
    }
  }, [eventId]);

  const resetForm = () => {
    setTitle('');
    setType('TALK');
    setPlannedStart('10:00');
    setDurationMin(30);
    setBreakAfterMin(0);
    setRoom('Main Auditorium');
    setPersonId('');
    setEditingActivity(null);
    setShowAddModal(false);
  };

  const openEdit = (act) => {
    setEditingActivity(act);
    setTitle(act.title);
    setType(act.type);
    setPlannedStart(act.planned_start);
    setDurationMin(act.duration_min);
    setBreakAfterMin(act.break_after_min);
    setRoom(act.room);
    setPersonId(act.person_id || '');
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingActivity) {
        await activitiesApi.update(editingActivity.id, {
          title,
          type,
          planned_start: plannedStart,
          duration_min: Number(durationMin),
          break_after_min: Number(breakAfterMin),
          room,
          person_id: personId || null
        });
      } else {
        await activitiesApi.create(eventId, {
          title,
          type,
          planned_start: plannedStart,
          duration_min: Number(durationMin),
          break_after_min: Number(breakAfterMin),
          room,
          person_id: personId || null
        });
      }
      resetForm();
      await refresh();
    } catch (err) {
      alert(err.message || 'Failed to save activity');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this session? Downstream times will cascade.')) return;
    try {
      await activitiesApi.delete(id);
      await refresh();
    } catch (err) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= agenda.length) return;

    const newOrder = [...agenda];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const orderedIds = newOrder.map(a => a.id);
    try {
      await activitiesApi.reorder(eventId, orderedIds);
      await refresh();
    } catch (err) {
      alert(err.message || 'Failed to reorder agenda');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Agenda Builder</h1>
          <p className="text-xs text-slate-500">
            Define activities, timing, and sequence. Downstream computed start times recalculate automatically.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add Session</span>
        </button>
      </div>

      {/* Agenda Sequence List */}
      <div className="panel overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-5 py-3.5 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Session Schedule ({agenda.length} total)
          </span>
          <span className="text-[11px] text-teal-800 font-medium">
            ⚡ Cascade Arithmetic Engine Active
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {agenda.map((act, index) => {
            const isDelayed = (act.delay_min || 0) > 0;
            return (
              <div
                key={act.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Left: Sequence + Reorder Controls + Info */}
                <div className="flex items-start gap-4">
                  {/* Sequence Reorder Buttons */}
                  <div className="flex flex-col items-center justify-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {act.sequence}
                    </span>
                    <button
                      disabled={index === agenda.length - 1}
                      onClick={() => handleMove(index, 1)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Title & Metadata */}
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {act.title}
                      </span>
                      <StatusBadge status={act.status} />
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {act.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-teal-600" />
                        <span>{act.person_name ? `${act.person_name} (${act.person_role || 'Speaker'})` : 'No speaker assigned'}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{act.room}</span>
                      </div>
                      <span>•</span>
                      <span>Duration: {act.duration_min}m</span>
                      {act.break_after_min > 0 && <span>(+{act.break_after_min}m break)</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Timings & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6">
                  {/* Computed Times Display */}
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium">
                      Planned: <span className="font-mono text-slate-600">{act.planned_start}</span>
                    </div>
                    <div className="font-mono text-sm font-bold mt-0.5">
                      {isDelayed ? (
                        <span className="text-amber-700 flex items-center gap-1.5 justify-end">
                          <span className="line-through text-slate-400 font-normal text-xs">{act.planned_start}</span>
                          <span>{act.computed_start} → {act.computed_end}</span>
                        </span>
                      ) : (
                        <span className="text-slate-900">{act.computed_start} → {act.computed_end}</span>
                      )}
                    </div>
                    {isDelayed && (
                      <span className="text-[10px] text-amber-700 font-semibold block">
                        +{act.delay_min}m delay applied
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(act)}
                      className="p-2 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(act.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="panel p-6 bg-white w-full max-w-lg shadow-xl animate-toast-in">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingActivity ? 'Edit Session' : 'Add New Session to Agenda'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Keynote — Future of AI"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500"
                  >
                    <option value="KEYNOTE">Keynote</option>
                    <option value="TALK">Talk</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="PANEL">Panel</option>
                    <option value="CEREMONY">Ceremony</option>
                    <option value="BREAK">Break</option>
                    <option value="JUDGING">Judging</option>
                    <option value="PERFORMANCE">Performance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Planned Start Time (HH:MM)
                  </label>
                  <input
                    type="time"
                    value={plannedStart}
                    onChange={(e) => setPlannedStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Break After (Minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={breakAfterMin}
                    onChange={(e) => setBreakAfterMin(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room / Stage
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Main Auditorium"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Speaker / Guest
                  </label>
                  <select
                    value={personId}
                    onChange={(e) => setPersonId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500"
                  >
                    <option value="">(None / Anchor)</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.designation || p.role_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
