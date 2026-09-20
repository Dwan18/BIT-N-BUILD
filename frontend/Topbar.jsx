import { Menu, Search } from 'lucide-react';
import NotificationBell from './NotificationBell';
import useNow from '../../hooks/useNow';

export default function Topbar({ onMenu }) {
  const now = useNow(15000);
  const date = new Date(now);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-700 bg-ink-900/85 px-4 py-3 backdrop-blur md:px-6">
      <button onClick={onMenu} className="grid h-10 w-10 place-items-center rounded-lg border border-ink-700 bg-ink-800 text-slate-300 lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>

      <label className="relative hidden max-w-md flex-1 sm:block">
        <span className="sr-only">Search events, speakers and sessions</span>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          placeholder="Search events, speakers, sessions"
          className="h-10 w-full rounded-lg border border-ink-700 bg-ink-800 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-signal-500"
        />
      </label>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right leading-tight md:block">
          <p className="font-display text-base font-semibold tabular-nums text-slate-50">
            {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
          <p className="text-xs text-slate-400">{date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}
