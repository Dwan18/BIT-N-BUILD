import { ArrowRight, CalendarPlus, Mic2, Radio, ShieldCheck } from 'lucide-react';

const DESIGNATIONS = [
  {
    id: 'organizer',
    name: 'Event Organizer',
    description: 'Plan events, coordinate teams and keep the full program moving.',
    icon: ShieldCheck,
    tone: 'text-signal-300 bg-signal-500/15 ring-signal-500/25',
    focus: 'Events, speakers and analytics',
  },
  {
    id: 'stage-manager',
    name: 'Stage Manager',
    description: 'Run the live schedule, manage stage flow and respond to changes.',
    icon: Radio,
    tone: 'text-live bg-live/15 ring-live/25',
    focus: 'Live control, agenda and announcements',
  },
  {
    id: 'speaker',
    name: 'Speaker',
    description: 'Prepare your sessions, review the agenda and stay event-ready.',
    icon: Mic2,
    tone: 'text-ok bg-ok/15 ring-ok/25',
    focus: 'Your sessions, agenda and updates',
  },
];

export default function DesignationSelection({ onSelect }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 py-6 md:py-12">
      <div className="max-w-2xl">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-signal-400">
          <CalendarPlus size={15} aria-hidden="true" /> StageFlow workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">What are you here to manage?</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-slate-400">
          Choose your designation to open the tools and live information that matter to your work today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {DESIGNATIONS.map(({ id, name, description, icon: Icon, tone, focus }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className="group flex min-h-[270px] flex-col rounded-2xl border border-ink-700 bg-ink-800/90 p-5 text-left shadow-panel transition-all hover:-translate-y-1 hover:border-signal-500/60 hover:bg-ink-800 focus-visible:-translate-y-1"
          >
            <span className={`grid h-12 w-12 place-items-center rounded-xl ring-1 ${tone}`}>
              <Icon size={23} aria-hidden="true" />
            </span>
            <span className="mt-8 text-xl font-semibold text-white">{name}</span>
            <span className="mt-2 flex-1 text-sm leading-6 text-slate-400">{description}</span>
            <span className="mt-5 flex items-center justify-between border-t border-ink-700 pt-4 text-xs text-slate-500">
              <span>{focus}</span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-700 text-slate-300 transition-colors group-hover:bg-signal-600 group-hover:text-white">
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}