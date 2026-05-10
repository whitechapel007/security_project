'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StrideCount } from '@/lib/types';

interface Props {
  data: StrideCount[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm max-w-[180px]">
      <p style={{ color: payload[0].payload.color }} className="font-medium">{payload[0].name}</p>
      <p className="text-slate-300">{payload[0].value} events</p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: { value: string; color: string }[] }) {
  return (
    <ul className="flex flex-col gap-1.5 text-xs">
      {payload?.map(entry => (
        <li key={entry.value} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-400 truncate">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function StrideDonutChart({ data }: Props) {
  const chartData = data.map(d => ({ name: d.category, value: d.count, color: d.color }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="40%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
