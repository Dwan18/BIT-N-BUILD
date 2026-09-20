import { Anchor, CalendarPlus, RadioTower, UsersRound } from 'lucide-react';

const DESIGNATIONS = [
  {
    id: 'organizer',
    name: 'Organizer',
    description: 'Create events, shape the agenda, and keep the whole production moving.',
    icon: CalendarPlus,
    tone: 'signal',
  },
  {
    id: 'coordinator',
    name: 'Coordinator',
    description: 'Monitor the live schedule, coordinate rooms, and respond to changes quickly.',
    icon: RadioTower,
    tone: 'amber',
  },
  {
    id: 'anchor',
    name: 'Anchor',
    description: 'Stay on top of what is live, what is next, and the words you need on stage.',
    icon: Anchor,
    tone: 'ok',
  },
];

const toneClasses = {
  signal: 'border-signal-500/30 bg-signal-500/10 text-signal-300 hover:border-signal-400/70',
  amber: 'border-amber/30 bg-amber/10 text-amber hover:border-amber/70',
  ok: 'border-ok/30 bg-ok/10 text-ok hover:border-ok/70',
};

export default function DesignationSelector({ onSelect }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-ink-600 bg-ink-800/80 shadow-panel">
      <div className="border-b border-ink-700 px-5 py-6 md:px-8 md:py-8">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-signal-500/15 text-signal-300">
            <UsersRound size={21} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-300">Welcome to StageFlow</p>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Choose your designation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Start with the workspace that matches your role. You can switch designation any time.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-3 md:p-6">
        {DESIGNATIONS.map(({ id, name, description, icon: Icon, tone }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`group rounded-xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-ink-700/50 focus-visible:-translate-y-0.5 ${toneClasses[tone]}`}
          >
            <span className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink-900/60">
                <Icon size={21} aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-0 transition group-hover:opacity-100">Select</span>
            </span>
            <span className="mt-6 block text-lg font-semibold text-slate-50">{name}</span>
            <span className="mt-2 block min-h-12 text-sm leading-5 text-slate-400">{description}</span>
            <span className="mt-5 inline-flex items-center text-sm font-semibold text-slate-200">Open workspace <span aria-hidden="true" className="ml-2 transition group-hover:translate-x-1">-&gt;</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}