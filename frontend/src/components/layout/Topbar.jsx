import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Radio, Users, Sparkles, SlidersHorizontal, Menu, Mic, Smartphone, Shield } from 'lucide-react';

export default function Topbar({ onMenu }) {
  const { role, switchRole, eventData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (newRole) => {
    switchRole(newRole);
    if (newRole === 'ORGANIZER') navigate('/organizer');
    else if (newRole === 'COORDINATOR') navigate('/coordinator');
    else if (newRole === 'ANCHOR') navigate('/anchor');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md md:px-6 shadow-sm">
      {/* Left: Mobile Menu & Event Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-slate-900">
                {eventData?.name || 'TechFest 2026'}
              </span>
              <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[11px] font-mono font-semibold text-teal-700 border border-teal-200">
                {eventData?.code || 'TF2026'}
              </span>
              {eventData?.status === 'LIVE' && (
                <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                  ON AIR
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {eventData?.venue || 'Main Auditorium'} · {eventData?.date || 'Today'}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Fast Role Switcher (Crucial for Demo/Judges side-by-side test) */}
      <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
        <button
          onClick={() => handleRoleChange('ORGANIZER')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors ${
            role === 'ORGANIZER'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="h-3.5 w-3.5 text-teal-600" />
          <span className="hidden sm:inline">Organizer</span>
        </button>

        <button
          onClick={() => handleRoleChange('COORDINATOR')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors ${
            role === 'COORDINATOR'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="h-3.5 w-3.5 text-amber-600" />
          <span className="hidden sm:inline">Coordinator</span>
        </button>

        <button
          onClick={() => handleRoleChange('ANCHOR')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors ${
            role === 'ANCHOR'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mic className="h-3.5 w-3.5 text-rose-600" />
          <span className="hidden sm:inline">Anchor Stage</span>
        </button>
      </div>

      {/* Right: Real-time clock & stream status */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Sync</span>
        </div>

        <div className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          {timeStr}
        </div>
      </div>
    </header>
  );
}
