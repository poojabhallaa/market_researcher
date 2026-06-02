'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';

const COLORS = ['#34d399', '#22d3ee', '#a78bfa', '#f59e0b', '#f87171', '#60a5fa', '#fb923c'];

interface PortfolioChartProps {
  data: Array<{ name: string; value: number }>;
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  if (!data.length) return null;

  return (
    <GlassCard className="p-6">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4">Portfolio Allocation</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [`$${typeof v === 'number' ? v.toFixed(2) : v}`, '']}
            contentStyle={{
              background: '#18181b',
              border: '1px solid rgba(63,63,70,0.6)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            itemStyle={{ color: '#d4d4d8' }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#a1a1aa', fontSize: '12px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
