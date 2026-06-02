'use client';
import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { useCandles } from '@/lib/hooks/useCandles';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Candle } from '@/lib/types/market';

interface PriceChartProps {
  symbol: string;
  resolution: string;
  from: number;
  to: number;
  previousClose?: number;
}

function formatTime(ts: number, resolution: string) {
  const d = new Date(ts * 1000);
  if (resolution === '5' || resolution === '60') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-800/60 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-zinc-100">${payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export function PriceChart({ symbol, resolution, from, to, previousClose }: PriceChartProps) {
  const { data: candles, isLoading, isError } = useCandles(symbol, resolution, from, to);

  if (isLoading) return <Skeleton className="h-72 w-full" />;

  if (isError || !Array.isArray(candles) || candles.length === 0) {
    return (
      <div className="h-72 w-full flex items-center justify-center bg-zinc-900/50 rounded-xl border border-zinc-800/60">
        <p className="text-sm text-zinc-500">No chart data available</p>
      </div>
    );
  }

  const chartData = candles.map((c: Candle) => ({
    time: formatTime(c.time, resolution),
    price: c.close,
  }));

  const prices = candles.map((c) => c.close);
  const minPrice = Math.min(...prices) * 0.999;
  const maxPrice = Math.max(...prices) * 1.001;
  const firstPrice = candles[0].close;
  const lastPrice = candles[candles.length - 1].close;
  const isPositive = lastPrice >= firstPrice;

  const strokeColor = isPositive ? '#34d399' : '#f87171';
  const gradientFrom = isPositive ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)';

  return (
    <ResponsiveContainer width="100%" height={288}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientFrom} stopOpacity={1} />
            <stop offset="95%" stopColor={gradientFrom} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minPrice, maxPrice]}
          tick={{ fontSize: 10, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        {previousClose && (
          <ReferenceLine
            y={previousClose}
            stroke="#52525b"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        )}
        <Area
          type="monotone"
          dataKey="price"
          stroke={strokeColor}
          strokeWidth={2}
          fill="url(#priceGrad)"
          dot={false}
          activeDot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
