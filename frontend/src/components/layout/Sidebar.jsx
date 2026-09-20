import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Sparkles, 
  SlidersHorizontal, 
  Mic, 
  Smartphone, 
  FileText,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ open, onClose }) {
  const { role, eventData } = useAuth();

  const organizerNav = [
    { to: '/organizer', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/organizer/agenda', label: 'Agenda Builder', icon: CalendarDays },
    { to: '/organizer/people', label: 'Speakers & Team', icon: Users },
    { to: '/organizer/scripts', label: 'AI Script Studio', icon: Sparkles },
    { to: '/organizer/live-control', label: 'Live Stage Control', icon: SlidersHorizontal },
  ];

  const coordinatorNav = [
    { to: '/coordinator', label: 'Backstage Control', icon: Smartphone },
  ];

  const anchorNav = [
    { to: '/anchor', label: 'Stage Teleprompter', icon: Mic },
    { to: '/anchor/brief', label: 'Event Brief', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-base font-bold text-slate-900 tracking-tight">
              SMART_STAGE
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-teal-700">
              Live Operating Platform
            </span>
          </div>
        </div>

        {/* Current Role Banner */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Active Console
            </span>
            <span className="text-xs font-bold text-slate-800">
              {role === 'ORGANIZER' && '👑 Organizer'}
              {role === 'COORDINATOR' && '📱 Coordinator'}
              {role === 'ANCHOR' && '🎤 Anchor'}
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono font-bold">
            {eventData?.code || 'TF2026'}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scroll-thin">
          {/* Section: Organizer Links */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Organizer Tools
            </div>
            <div className="space-y-1">
              {organizerNav.map(({ to, label, icon: Icon, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200/80 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-teal-600" />
                    <span>{label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </NavLink>
              ))}
            </div>
          </div>

          {/* Section: Coordinator Links */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Backstage Ops
            </div>
            <div className="space-y-1">
              {coordinatorNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200/80 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-amber-600" />
                    <span>{label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </NavLink>
              ))}
            </div>
          </div>

          {/* Section: Anchor Links */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Anchor Lectern
            </div>
            <div className="space-y-1">
              {anchorNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-rose-50 text-rose-900 font-semibold border border-rose-200/80 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-rose-600" />
                    <span>{label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer: Quick Join / Info */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <div className="text-xs text-slate-500 mb-2">
            Joined as <strong className="text-slate-800">{eventData?.name || 'TechFest'}</strong>
          </div>
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <span>Landing / Switch Event</span>
            <ExternalLink className="h-3 w-3" />
          </NavLink>
        </div>
      </aside>
    </>
  );
}
