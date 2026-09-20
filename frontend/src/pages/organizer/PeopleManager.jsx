import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { peopleApi } from '../../services/api';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Award, 
  Briefcase, 
  BookOpen, 
  CheckCircle2, 
  X,
  ShieldAlert
} from 'lucide-react';

export default function PeopleManager() {
  const { eventId } = useAuth();
  const [people, setPeople] = useState([]);
  const [activeTab, setActiveTab] = useState('SPEAKERS'); // SPEAKERS | JURY | ALL
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [showModal, setShowModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [name, setName] = useState('');
  const [roleType, setRoleType] = useState('SPEAKER');
  const [designation, setDesignation] = useState('');
  const [organization, setOrganization] = useState('');
  const [topic, setTopic] = useState('');
  const [bio, setBio] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadPeople = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const list = await peopleApi.list(eventId);
      setPeople(list);
    } catch (err) {
      console.error('Failed to load people:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeople();
  }, [eventId]);

  const resetForm = () => {
    setName('');
    setRoleType('SPEAKER');
    setDesignation('');
    setOrganization('');
    setTopic('');
    setBio('');
    setEditingPerson(null);
    setShowModal(false);
  };

  const openEdit = (p) => {
    setEditingPerson(p);
    setName(p.name);
    setRoleType(p.role_type);
    setDesignation(p.designation || '');
    setOrganization(p.organization || '');
    setTopic(p.topic || '');
    setBio(p.bio || '');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingPerson) {
        await peopleApi.update(editingPerson.id, {
          name,
          role_type: roleType,
          designation,
          organization,
          topic,
          bio: bio.trim() ? bio.trim() : null
        });
      } else {
        await peopleApi.create(eventId, {
          name,
          role_type: roleType,
          designation,
          organization,
          topic,
          bio: bio.trim() ? bio.trim() : null
        });
      }
      resetForm();
      await loadPeople();
    } catch (err) {
      alert(err.message || 'Failed to save person');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this person?')) return;
    try {
      await peopleApi.delete(id);
      await loadPeople();
    } catch (err) {
      alert(err.message || 'Failed to delete person');
    }
  };

  const filtered = people.filter(p => {
    if (activeTab === 'SPEAKERS') return ['SPEAKER', 'GUEST', 'CHIEF_GUEST'].includes(p.role_type);
    if (activeTab === 'JURY') return p.role_type === 'JURY';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Speakers, Guests & Jury</h1>
          <p className="text-xs text-slate-500">
            Profiles stored here serve as the single source of truth for all AI-generated stage scripts.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add Speaker / Guest</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('SPEAKERS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'SPEAKERS'
              ? 'bg-teal-50 text-teal-800 border border-teal-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Speakers & Guests ({people.filter(p => ['SPEAKER', 'GUEST', 'CHIEF_GUEST'].includes(p.role_type)).length})
        </button>

        <button
          onClick={() => setActiveTab('JURY')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'JURY'
              ? 'bg-teal-50 text-teal-800 border border-teal-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Jury Members ({people.filter(p => p.role_type === 'JURY').length})
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'ALL'
              ? 'bg-teal-50 text-teal-800 border border-teal-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Profiles ({people.length})
        </button>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const hasBio = Boolean(p.bio);
          return (
            <div key={p.id} className="panel p-5 bg-white flex flex-col justify-between hover:shadow-card transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {p.role_type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {p.designation} {p.organization ? `· ${p.organization}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded text-slate-400 hover:text-teal-700 hover:bg-teal-50"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {p.topic && (
                  <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 block">Topic / Session:</span>
                    <span className="text-slate-600 font-medium">"{p.topic}"</span>
                  </div>
                )}

                <div className="mt-3">
                  {hasBio ? (
                    <p className="text-xs text-slate-500 line-clamp-3">
                      {p.bio}
                    </p>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>No bio supplied — AI will ground intro strictly in credentials alone.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Grounded Profile</span>
                <span className="text-emerald-700 font-medium">✓ Verified</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="panel p-6 bg-white w-full max-w-lg shadow-xl animate-toast-in">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPerson ? 'Edit Profile' : 'Add New Speaker / Jury'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Mehta"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Type
                  </label>
                  <select
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500"
                  >
                    <option value="SPEAKER">Speaker</option>
                    <option value="KEYNOTE">Keynote Speaker</option>
                    <option value="GUEST">Guest of Honor</option>
                    <option value="CHIEF_GUEST">Chief Guest</option>
                    <option value="JURY">Jury Member</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Chief Technology Officer"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. ABC Technologies"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Presentation Topic / Area
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Future of AI & Scalable Inference"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Speaker Bio (Optional)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="3"
                  placeholder="Leave empty to test anti-hallucination guardrail (AI will not invent credentials)."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                ></textarea>
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
                  {formLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
