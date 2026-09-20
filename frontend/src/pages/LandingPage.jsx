import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { 
  Radio, 
  Shield, 
  Smartphone, 
  Mic, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  PlusCircle, 
  KeyRound,
  Zap,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { switchRole, joinEvent, selectEvent } = useAuth();

  const [joinCode, setJoinCode] = useState('TF2026');
  const [joinRole, setJoinRole] = useState('ORGANIZER');
  const [joinPin, setJoinPin] = useState('1234');
  const [joinName, setJoinName] = useState('Aarav');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Create Event Form state
  const [showCreate, setShowCreate] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDate, setEventDate] = useState('2026-03-15');
  const [createLoading, setCreateLoading] = useState(false);

  const quickLaunch = (roleToLaunch) => {
    switchRole(roleToLaunch);
    selectEvent('evt_techfest2026');
    if (roleToLaunch === 'ORGANIZER') navigate('/organizer');
    else if (roleToLaunch === 'COORDINATOR') navigate('/coordinator');
    else if (roleToLaunch === 'ANCHOR') navigate('/anchor');
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError('');
    try {
      await joinEvent(joinCode.trim().toUpperCase(), joinRole, joinName, joinPin);
      if (joinRole === 'ORGANIZER') navigate('/organizer');
      else if (joinRole === 'COORDINATOR') navigate('/coordinator');
      else navigate('/anchor');
    } catch (err) {
      setJoinError(err.message || 'Failed to join event');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!eventName) return;
    setCreateLoading(true);
    try {
      const res = await authApi.createEvent({
        name: eventName,
        venue: eventVenue || 'Main Auditorium',
        date: eventDate,
        organizer_pin: '1234'
      });
      selectEvent(res.event.id);
      switchRole('ORGANIZER');
      navigate('/organizer');
    } catch (err) {
      alert(err.message || 'Create event failed');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tight text-slate-900">
                SMART_STAGE
              </span>
              <span className="text-[10px] block font-bold tracking-widest text-teal-700 uppercase">
                Dynamic Stage Operating System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <PlusCircle className="h-4 w-4 text-teal-600" />
              <span>Create Event</span>
            </button>
            <button
              onClick={() => quickLaunch('ORGANIZER')}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm transition-colors"
            >
              <span>Demo TechFest 2026</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800 mb-5 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-teal-600" />
            <span>Problem Statement PS-5 · Full Real-Time Stage Operating Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-5 font-display">
            Plan cleanly. Report backstage reality. <br />
            <span className="text-teal-700">Give the anchor the exact words.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Deterministic backend arithmetic recalculates the entire schedule downstream on delay. The AI engine sizes contextual speech to the anchor’s actual speaking gap.
          </p>
        </div>

        {/* 1-Click Launch Cards (Primary for Demo & Evaluation) */}
        <div className="mb-14">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              One-Click Role Launch for TechFest 2026 Demo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Organizer */}
            <div 
              onClick={() => quickLaunch('ORGANIZER')}
              className="panel-interactive p-6 cursor-pointer border-t-4 border-t-teal-600 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    PIN: 1234
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                  Organizer Console
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Manage the schedule, add speakers, review live readiness, and batch pre-generate all AI scripts in the AI Script Studio.
                </p>
                <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    <span>Agenda CRUD & Drag Reordering</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    <span>Batch AI Script Studio</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    <span>Live Readiness Checklist</span>
                  </div>
                </div>
              </div>

              <button className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg bg-teal-600 py-2 text-xs font-semibold text-white group-hover:bg-teal-700 shadow-sm transition-colors">
                <span>Enter as Organizer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card 2: Coordinator */}
            <div 
              onClick={() => quickLaunch('COORDINATOR')}
              className="panel-interactive p-6 cursor-pointer border-t-4 border-t-amber-500 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Backstage Mobile
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                  Coordinator Board
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Backstage operations screen. Report what is happening in reality in 2 taps: delays, room changes, emergency announcements.
                </p>
                <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                    <span>Thumb-sized Start / Complete buttons</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                    <span>2-Tap Delay Reporter (+15m cascade)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                    <span>Room Change & Operational Broadcast</span>
                  </div>
                </div>
              </div>

              <button className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg bg-amber-600 py-2 text-xs font-semibold text-white group-hover:bg-amber-700 shadow-sm transition-colors">
                <span>Enter as Coordinator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card 3: Anchor */}
            <div 
              onClick={() => quickLaunch('ANCHOR')}
              className="panel-interactive p-6 cursor-pointer border-t-4 border-t-rose-500 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold">
                    <Mic className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                    Stage Lectern
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-rose-700 transition-colors">
                  Anchor Stage View
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Podium teleprompter with live countdown, NEXT card, grounded AI script reader, and "I have 20 seconds" quick actions.
                </p>
                <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>NOW Card with Live Countdown</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>Grounded Fact-Checked Teleprompter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>"I Have 20s" Dynamic Adaptation</span>
                  </div>
                </div>
              </div>

              <button className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg bg-rose-600 py-2 text-xs font-semibold text-white group-hover:bg-rose-700 shadow-sm transition-colors">
                <span>Enter as Anchor Stage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Join by Code or Create Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Join Panel */}
          <div className="panel p-6 bg-white">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-teal-600" />
              <span>Join an Existing Event</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the 6-character event code and select your role to join the live room.
            </p>

            {joinError && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Character Event Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  placeholder="e.g. TF2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono font-bold tracking-wider uppercase focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="e.g. Priya"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Role
                  </label>
                  <select
                    value={joinRole}
                    onChange={(e) => setJoinRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 bg-white"
                  >
                    <option value="ORGANIZER">Organizer</option>
                    <option value="COORDINATOR">Coordinator</option>
                    <option value="ANCHOR">Anchor</option>
                  </select>
                </div>
              </div>

              {joinRole === 'ORGANIZER' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organizer PIN (Demo: 1234)
                  </label>
                  <input
                    type="password"
                    value={joinPin}
                    onChange={(e) => setJoinPin(e.target.value)}
                    placeholder="4-digit PIN"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 font-mono"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={joinLoading}
                className="w-full mt-2 rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {joinLoading ? 'Joining Room...' : 'Connect to Event Stream'}
              </button>
            </form>
          </div>

          {/* Architecture / Highlights */}
          <div className="panel p-6 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-600" />
                <span>Deterministic Core vs AI Engine</span>
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                As specified in Section 6 of the README, schedule arithmetic is 100% deterministic and never guessed by an LLM.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="font-bold text-teal-700 block mb-0.5">Deterministic Backend Core</span>
                  <p className="text-slate-600 text-[11px]">
                    Maintains sequence, planned start, duration, cascading delay recompute, pull-forward prevention, and speaking gaps.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="font-bold text-rose-700 block mb-0.5">Smart AI Script Engine</span>
                  <p className="text-slate-600 text-[11px]">
                    Renderer of state into speech. Grounded strictly in speaker profiles. Zero invented credentials. Automatically falls back to offline templates if disconnected.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Status: Ready for Live Demo</span>
              <span className="font-mono text-teal-700 font-semibold">Port 5001 (API) · 5173 (UI)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
