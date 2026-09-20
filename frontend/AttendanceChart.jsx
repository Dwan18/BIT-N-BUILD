import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

export const ChartTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-0.5 text-slate-400">{label}</p>}
      <p className="font-semibold text-slate-50">{payload[0].value.toLocaleString()} {unit}</p>
    </div>
  );
};

export default function AttendanceChart({ data, loading }) {
  return (
    <Card title="Live attendance" subtitle="Attendees online across today's sessions">
      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="h-64" role="img" aria-label="Area chart of attendees online by hour">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="attFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4d9bff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#4d9bff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1c3563" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#8fa3c4', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8fa3c4', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit="attendees" />} cursor={{ stroke: '#2a4a82' }} />
              <Area type="monotone" dataKey="attendees" stroke="#4d9bff" strokeWidth={2.5} fill="url(#attFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
