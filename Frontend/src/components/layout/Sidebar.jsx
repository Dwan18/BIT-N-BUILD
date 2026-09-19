import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { navItems } from './navItems';
import { LiveDot } from '../ui/StatusBadge';
import Avatar from '../ui/Avatar';

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-700 ring-1 ring-signal-500/30">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <path d="M6 21c4.5-10 15.500-10 20 0" stroke="#4d9bff" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="16" cy="22" r="2.800" fill="#ff5c6c" />
        </svg>
      </span>
      <div className="leading-tight">
        <p className="font-display text-lg font-semibold text-white">StageFlow</p>
        <p className="text-xs text-slate-400">Anchor and stage control</p>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink-700 bg-ink-850 transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Brand />
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-ink-700 hover:text-white lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map(({ to, label, icon: Icon, end, live }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-signal-500/15 text-white' : 'text-slate-400 hover:bg-ink-700/60 hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-signal-400" />}
                  <Icon size={18} className={isActive ? 'text-signal-400' : ''} aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {live && <LiveDot size="sm" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800 p-3">
          <Avatar name="Karan Desai" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-slate-100">Karan Desai</p>
            <p className="truncate text-xs text-slate-400">Organizer</p>
          </div>
        </div>
      </aside>
    </>
  );
}
