import { useNavigate } from 'react-router-dom';
import { CalendarPlus, UserPlus, ListChecks, Play } from 'lucide-react';
import Card from '../ui/Card';
import { useNotifications } from '../../context/NotificationContext';

const ACTIONS = [
  { id: 'create-event', label: 'Create event', hint: 'Set up dates, venue and stages', icon: CalendarPlus, to: '/events', message: 'Opening the event builder', tone: 'text-signal-400 bg-signal-500/15' },
  { id: 'add-speaker', label: 'Add speaker', hint: 'Invite and assign to sessions', icon: UserPlus, to: '/speakers', message: 'Opening the speaker form', tone: 'text-ok bg-ok/15' },
  { id: 'manage-agenda', label: 'Manage agenda', hint: 'Reorder and reschedule sessions', icon: ListChecks, to: '/agenda', message: 'Opening the agenda editor', tone: 'text-amber bg-amber/15' },
  { id: 'start-live', label: 'Start live event', hint: 'Go on air and open controls', icon: Play, to: '/live-control', message: 'Live control is ready', tone: 'text-live bg-live/15' },
];

export default function QuickActions() {
  const navigate = useNavigate();
  const { toast } = useNotifications();

  const run = (action) => {
    // Wire real calls here, e.g. eventsApi.startLive(eventId) for 'start-live'.
    toast(action.message, 'info');
    navigate(action.to);
  };

  return (
    <Card title="Quick actions" bodyClassName="p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => run(a)}
            className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850 p-3 text-left transition-colors hover:border-signal-500/50 hover:bg-ink-700/50"
          >
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${a.tone}`}>
              <a.icon size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-50">{a.label}</span>
              <span className="block truncate text-xs text-slate-400">{a.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
