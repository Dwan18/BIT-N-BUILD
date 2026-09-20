import { Construction } from 'lucide-react';
import Card from '../components/ui/Card';

// Stand-in for modules that are not built yet. Replace per route as you go.
export default function PlaceholderPage({ title, description, endpoint }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      <Card>
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-signal-500/15 text-signal-400">
            <Construction size={22} />
          </span>
          <p className="font-medium text-slate-50">This module is next on the build list</p>
          <p className="max-w-md text-sm text-slate-400">
            Connect it to <code className="rounded bg-ink-700 px-1.5 py-0.5 text-signal-300">{endpoint}</code> on your Express API and build the screen in <code className="rounded bg-ink-700 px-1.5 py-0.5 text-signal-300">src/pages</code>.
          </p>
        </div>
      </Card>
    </div>
  );
}
