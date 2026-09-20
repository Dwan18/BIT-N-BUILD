import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import { ChartTooltip } from './AttendanceChart';

const COLORS = { completed: '#34d399', live: '#ff5c6c', delayed: '#f5b84b', scheduled: '#2a4a82' };

export default function SessionStatusChart({ data, loading }) {
  const total = data?.reduce((n, d) => n + d.value, 0) ?? 0;

  return (
    <Card title="Session status" subtitle="Today's sessions by state">
      {loading ? (
        <Skeleton className="h-56" />
      ) : (
        <>
          <div className="relative h-44" role="img" aria-label="Donut chart of session status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={52} outerRadius={74} paddingAngle={3} stroke="none">
                  {data.map((d) => <Cell key={d.key} fill={COLORS[d.key]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip unit="sessions" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-2xl font-semibold text-white">{total}</p>
                <p className="text-xs text-slate-400">sessions</p>
              </div>
            </div>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {data.map((d) => (
              <li key={d.key} className="flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[d.key] }} />
                {d.name}
                <span className="ml-auto tabular-nums text-slate-400">{d.value}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
