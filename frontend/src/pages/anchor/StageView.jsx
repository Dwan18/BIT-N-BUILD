import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLiveState } from '../../hooks/useLiveState';
import { scriptsApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  MapPin, 
  User, 
  Volume2, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Info,
  Layers
} from 'lucide-react';

export default function StageView() {
  const { eventId, userName } = useAuth();
  const { liveState, refresh, lastUpdate } = useLiveState(eventId);

  const [activeScript, setActiveScript] = useState(null);
  const [scriptVersions, setScriptVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [stageMode, setStageMode] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const current = liveState?.current;
  const next = liveState?.next;
  const driftMin = liveState?.drift_min ?? 0;
  const gapToNextSec = liveState?.gap_to_next_sec ?? 30;
  const updates = liveState?.recent_updates || [];

  // Countdown timer state
  const [remainingSec, setRemainingSec] = useState(0);
  const [isOverrun, setIsOverrun] = useState(false);

  // Sync countdown from current activity
  useEffect(() => {
    if (!current?.computed_end) return;

    const compute = () => {
      const parts = current.computed_end.split(':');
      const targetMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
      const diffSec = Math.round((targetMin - nowMin) * 60);

      if (diffSec >= 0) {
        setRemainingSec(diffSec);
        setIsOverrun(false);
      } else {
        setRemainingSec(Math.abs(diffSec));
        setIsOverrun(true);
      }
    };

    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [current?.computed_end]);

  // Load scripts for the active activity
  useEffect(() => {
    async function loadScripts() {
      if (!eventId) return;
      try {
        const all = await scriptsApi.getEventScripts(eventId);
        if (all.length > 0) {
          // Find script matching current activity or opening
          const matching = current
            ? all.filter(s => s.activity_id === current.id || s.script_type === 'speaker_introduction')
            : all;
          const target = matching[0] || all[0];
          setActiveScript(target);
          setSelectedVersionId(target.id);
          setScriptVersions(all.filter(s => s.activity_id === target.activity_id && s.script_type === target.script_type));
        }
      } catch (err) {
        console.error('Error fetching stage scripts:', err);
      }
    }
    loadScripts();
  }, [eventId, current?.id]);

  // Detect incoming updates and display stage toast
  useEffect(() => {
    if (lastUpdate) {
      setToastMessage(lastUpdate.message);
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  // Quick Action Handler (§8.5)
  const handleQuickAction = async (modifier, customSec = null) => {
    if (!activeScript) return;
    setGenerating(true);
    try {
      const payload = { modifier };
      if (customSec) {
        payload.target_duration_seconds = customSec;
      }
      const res = await scriptsApi.regenerate(activeScript.id, payload);
      setActiveScript(res);
      setSelectedVersionId(res.id);
      // reload versions
      const all = await scriptsApi.getEventScripts(eventId);
      setScriptVersions(all.filter(s => s.activity_id === res.activity_id && s.script_type === res.script_type));
    } catch (err) {
      alert(err.message || 'Regeneration failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleVersionChange = (scriptId) => {
    const found = scriptVersions.find(s => s.id === scriptId);
    if (found) {
      setActiveScript(found);
      setSelectedVersionId(found.id);
    }
  };

  const formatCountdown = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const countdownAmber = !isOverrun && remainingSec < 120;

  return (
    <div className={`space-y-5 ${stageMode ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : ''}`}>
      {/* Real-Time Update Toast Banner (Non-blocking stage banner) */}
      {toastMessage && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 shadow-stage flex items-center justify-between animate-toast-in">
          <div className="flex items-center gap-2.5">
            <span className="text-base">⚠️</span>
            <div>
              <span className="text-xs font-bold text-amber-900 block">Stage Flow Update Received</span>
              <span className="text-xs text-amber-800 font-medium">{toastMessage}</span>
            </div>
          </div>
          <button
            onClick={() => handleQuickAction('delay')}
            className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-700 shadow-sm"
          >
            Adapt Script Now
          </button>
        </div>
      )}

      {/* Stage Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping"></span>
            <span className="font-display font-black text-lg tracking-tight text-slate-900">
              STAGE VIEW
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {userName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Schedule Drift Indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
            driftMin > 0 
              ? 'bg-amber-50 text-amber-800 border-amber-300' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}>
            <Clock className="h-3.5 w-3.5" />
            <span>{driftMin > 0 ? `+${driftMin}m Schedule Drift` : 'Strictly On Schedule'}</span>
          </div>

          <button
            onClick={() => setStageMode(!stageMode)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
            title="Toggle high-contrast lectern mode"
          >
            {stageMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{stageMode ? 'Exit Stage Mode' : 'Stage Mode'}</span>
          </button>
        </div>
      </div>

      {/* Top 2 Cards: NOW & NEXT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* NOW CARD (7 cols) - Primary Focal Point */}
        <div className="md:col-span-7 panel p-6 bg-white border-2 border-slate-300 shadow-stage flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                NOW ON STAGE
              </span>
              {current && <StatusBadge status={current.status} />}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display mb-2 tracking-tight">
              {current?.title || 'Opening Preparations'}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-600 mb-4 flex-wrap">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-teal-600" />
                <span className="font-semibold text-slate-800">{current?.person || 'Stage MC'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{current?.room || 'Main Stage'}</span>
              </div>
            </div>
          </div>

          {/* Live Countdown Clock Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {isOverrun ? 'OVERRUN TIME' : 'TIME REMAINING'}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                Scheduled: {current?.computed_start} → {current?.computed_end}
              </span>
            </div>

            <div className={`font-mono text-3xl sm:text-4xl font-black px-4 py-1.5 rounded-xl border ${
              isOverrun 
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : countdownAmber
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-100 text-slate-900 border-slate-200'
            }`}>
              {isOverrun && '+'}
              {formatCountdown(remainingSec)}
            </div>
          </div>
        </div>

        {/* NEXT CARD (5 cols) */}
        <div className="md:col-span-5 panel p-6 bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                UP NEXT
              </span>
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {next?.computed_start || 'Next'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-display mb-1.5">
              {next?.title || 'Event Concludes'}
            </h3>

            <div className="space-y-1.5 text-xs text-slate-600 mb-3">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>{next?.person || 'Anchor / Organizer'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{next?.room || 'Main Hall'}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Available Speaking Window:</span>
            <span className="font-mono font-bold text-teal-800">{gapToNextSec}s</span>
          </div>
        </div>
      </div>

      {/* Main Smart Teleprompter Section */}
      <div className="panel p-6 bg-white border-2 border-teal-500/40 shadow-stage">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            <h3 className="font-display font-black text-base text-slate-900">
              SMART STAGE TELEPROMPTER
            </h3>
            <span className="rounded bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 border border-teal-200">
              {activeScript?.script_type?.replace('_', ' ') || 'Stage Script'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Version Switcher */}
            {scriptVersions.length > 1 && (
              <div className="flex items-center gap-1 text-xs">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedVersionId}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="rounded border border-slate-300 px-2 py-1 text-xs font-mono font-semibold bg-white"
                >
                  {scriptVersions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.version} ({v.estimated_duration_seconds}s - {v.source})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Grounded in event data</span>
            </span>
          </div>
        </div>

        {/* The Spoken Words (High-readability Stage Font) */}
        <div className="my-5 p-6 rounded-xl bg-slate-50/80 border border-slate-200/90">
          {generating ? (
            <div className="py-8 text-center text-teal-700 flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="font-bold text-sm">Synthesizing grounded stage words...</span>
            </div>
          ) : activeScript ? (
            <div>
              <p className="text-xl sm:text-2xl font-medium text-slate-900 leading-relaxed font-sans select-all tracking-normal">
                "{activeScript.content}"
              </p>

              {activeScript.alternative && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-600 flex items-start gap-2">
                  <span className="font-bold text-slate-800 shrink-0">Quick alternative:</span>
                  <span className="italic">"{activeScript.alternative}"</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-sm">
              No script loaded yet. Click any quick action below to generate instantly.
            </div>
          )}
        </div>

        {/* Script Provenance Note */}
        {activeScript?.context_note && (
          <div className="mb-4 text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-teal-600" />
            <span>{activeScript.context_note}</span>
          </div>
        )}

        {/* Quick Action One-Tap Adaptation Bar (§8.5) */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            One-Tap Quick Actions (Real-Time Script Adaptation)
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* The 20-second differentiator button */}
            <button
              onClick={() => handleQuickAction('20_seconds', 20)}
              disabled={generating}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-700 active:scale-95 transition-all shadow-sm"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>I have 20 seconds</span>
            </button>

            {/* Use actual gap straight from scheduler */}
            <button
              onClick={() => handleQuickAction('gap', gapToNextSec)}
              disabled={generating}
              className="flex items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-900 hover:bg-teal-100 transition-colors"
              title="Sizes words to computed schedule gap"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Use my actual gap ({gapToNextSec}s)</span>
            </button>

            <button
              onClick={() => handleQuickAction('shorter')}
              disabled={generating}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Make shorter
            </button>

            <button
              onClick={() => handleQuickAction('longer')}
              disabled={generating}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Make longer
            </button>

            <button
              onClick={() => handleQuickAction('formal')}
              disabled={generating}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              More formal
            </button>

            <button
              onClick={() => handleQuickAction('casual')}
              disabled={generating}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              More casual
            </button>

            <button
              onClick={() => handleQuickAction('regenerate')}
              disabled={generating}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Updates Feed Ticker */}
      <div className="panel p-4 bg-white border border-slate-200">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
          Backstage Updates Feed
        </span>
        <div className="space-y-2">
          {updates.slice(0, 3).map((u) => (
            <div key={u.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span className="font-semibold text-slate-800">{u.message}</span>
                {u.reason && <span className="text-slate-500 text-[11px]">({u.reason})</span>}
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
