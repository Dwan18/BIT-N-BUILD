import {
  LayoutDashboard, CalendarDays, ClipboardList, Mic, Sparkles,
  Radio, Megaphone, BarChart3, Settings,
} from 'lucide-react';

export const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/agenda', label: 'Agenda', icon: ClipboardList },
  { to: '/speakers', label: 'Speakers', icon: Mic },
  { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/live-control', label: 'Live Control', icon: Radio, live: true },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];
