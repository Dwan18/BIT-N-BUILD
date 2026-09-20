import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLiveState } from '../../hooks/useLiveState';
import { scriptsApi } from '../../services/api';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Edit3, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Check,
  X
} from 'lucide-react';

export default function ScriptStudio() {
  const { eventId } = useAuth();
  const { liveState } = useLiveState(eventId);

  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Single Generate Modal
  const [targetActivity, setTargetActivity] = useState(null);
  const [scriptType, setScriptType] = useState('speaker_introduction');
  const [targetDuration, setTargetDuration] = useState(30);
  const [lengthMode, setLengthMode] = useState('short');
  const [tone, setTone] = useState('warm_formal');
  const [generating, setGenerating] = useState(false);

  // Manual Edit Modal
  const [editingScript, setEditingScript] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editAlt, setEditAlt] = useState('');

  const agenda = liveState?.agenda || [];

  const loadScripts = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const data = await scriptsApi.getEventScripts(eventId);
      setScripts(data);
    } catch (err) {
      console.error('Failed to load scripts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScripts();
  }, [eventId]);

  const handleGenerateBatch = async () => {
    if (!confirm('Pre-generate opening ceremony, all speaker introductions, transitions, and closing script?')) return;
    setBatchLoading(true);
    try {
      const res = await scriptsApi.generateBatch(eventId);
      alert(`Successfully generated ${res.total_generated} stage scripts!`);
      await loadScripts();
    } catch (err) {
      alert(err.message || 'Batch generation failed');
    } finally {
      setBatchLoading(false);
    }
  };

  const openGenerateModal = (act) => {
    setTargetActivity(act);
    setScriptType(act ? (act.type === 'CEREMONY' ? 'opening' : 'speaker_introduction') : 'opening');
    setTargetDuration(30);
    setLengthMode('short');
    setTone('warm_formal');
  };

  const handleSingleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await scriptsApi.generate(eventId, {
        activity_id: targetActivity?.id || null,
        script_type: scriptType,
        target_duration_seconds: Number(targetDuration),
        length_mode: lengthMode,
        tone: tone
      });
      setTargetActivity(null);
      await loadScripts();
    } catch (err) {
      alert(err.message || 'Script generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    if (!editingScript) return;
    try {
      await scriptsApi.editManual(editingScript.id, {
        content: editContent,
        alternative: editAlt
      });
      setEditingScript(null);
      await loadScripts();
    } catch (err) {
      alert(err.message || 'Save failed');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="panel p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-teal-600" />
              <h1 className="text-2xl font-black text-slate-900 font-display">
                AI Script Studio
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Pre-event preparation and grounded speech synthesis. Calibrated to natural speaking cadence (130 WPM).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openGenerateModal(agenda[0] || null)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>Custom Script</span>
            </button>

            <button
              onClick={handleGenerateBatch}
              disabled={batchLoading}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${batchLoading ? 'animate-spin' : ''}`} />
              <span>{batchLoading ? 'Generating Full Suite...' : 'Generate All Scripts (Batch)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Script Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
          <span>Active Prepared Scripts ({scripts.length} versions stored)</span>
          <span>Source: AI Grounded & Offline Templates</span>
        </div>

        {scripts.length === 0 ? (
          <div className="panel p-12 text-center bg-white">
            <Sparkles className="h-10 w-10 text-teal-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No scripts generated yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Click "Generate All Scripts (Batch)" above to automatically create opening, speaker introductions, transitions, and closing speech for TechFest 2026.
            </p>
            <button
              onClick={handleGenerateBatch}
              disabled={batchLoading}
              className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
            >
              Batch Generate Scripts Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {scripts.map((s) => {
              const act = agenda.find(a => a.id === s.activity_id);
              const isCopied = copiedId === s.id;

              return (
                <div key={s.id} className="panel p-5 bg-white flex flex-col justify-between hover:shadow-card transition-shadow">
                  <div>
                    {/* Header Strip */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                            {s.script_type.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            v{s.version}
                          </span>
                          {s.source === 'ai' ? (
                            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                              Gemini
                            </span>
                          ) : s.source === 'manual' ? (
                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                              Manual
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              Template
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">
                          {act ? act.title : 'General Event Script'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(s.content, s.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Copy script"
                        >
                          {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingScript(s);
                            setEditContent(s.content);
                            setEditAlt(s.alternative || '');
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-teal-700 hover:bg-teal-50"
                          title="Edit text"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Main Script Text */}
                    <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 mb-3 text-sm text-slate-800 leading-relaxed font-sans">
                      "{s.content}"
                    </div>

                    {/* Alternative Punchy Text */}
                    {s.alternative && (
                      <div className="text-xs text-slate-500 mb-3">
                        <strong className="text-slate-700">Quick Alternative: </strong>
                        <span>"{s.alternative}"</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>~{s.estimated_duration_seconds}s speaking time</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Grounded</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Single Script Generator Modal */}
      {targetActivity !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="panel p-6 bg-white w-full max-w-md shadow-xl animate-toast-in">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <span>Generate Grounded Stage Script</span>
              </h3>
              <button onClick={() => setTargetActivity(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSingleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Session
                </label>
                <select
                  value={targetActivity?.id || ''}
                  onChange={(e) => {
                    const found = agenda.find(a => a.id === e.target.value);
                    setTargetActivity(found || null);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500"
                >
                  <option value="">(Opening / General Event)</option>
                  {agenda.map(a => (
                    <option key={a.id} value={a.id}>
                      #{a.sequence} {a.title} ({a.person_name || 'No speaker'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Script Type
                  </label>
                  <select
                    value={scriptType}
                    onChange={(e) => setScriptType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500"
                  >
                    <option value="speaker_introduction">Speaker Intro</option>
                    <option value="transition">Transition Bridge</option>
                    <option value="opening">Opening Script</option>
                    <option value="closing">Closing Script</option>
                    <option value="delay_announcement">Delay Announcement</option>
                    <option value="break_announcement">Break Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Speaking Length
                  </label>
                  <select
                    value={lengthMode}
                    onChange={(e) => {
                      setLengthMode(e.target.value);
                      if (e.target.value === 'very_short') setTargetDuration(15);
                      else if (e.target.value === 'short') setTargetDuration(25);
                      else if (e.target.value === 'medium') setTargetDuration(45);
                      else setTargetDuration(80);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500"
                  >
                    <option value="very_short">Very Short (~15s)</option>
                    <option value="short">Short (~25s)</option>
                    <option value="medium">Medium (~45s)</option>
                    <option value="detailed">Detailed (~80s)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Duration (Sec)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-500"
                  >
                    <option value="warm_formal">Warm & Formal</option>
                    <option value="casual">Energetic & Casual</option>
                    <option value="celebratory">Celebratory</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTargetActivity(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate Script'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Edit Modal */}
      {editingScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="panel p-6 bg-white w-full max-w-lg shadow-xl animate-toast-in">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Edit Script (Saves as new version)
              </h3>
              <button onClick={() => setEditingScript(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleManualSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Spoken Script Text
                </label>
                <textarea
                  rows="4"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-teal-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alternative / One-Liner
                </label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingScript(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm"
                >
                  Save as New Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
