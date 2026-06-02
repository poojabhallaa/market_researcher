'use client';
import { cn } from '@/lib/utils';

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (t: Timeframe) => void;
}

const OPTIONS: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];

export function getTimeframeParams(tf: Timeframe): { resolution: string; from: number; to: number } {
  const now = Math.floor(Date.now() / 1000);
  const map: Record<Timeframe, { resolution: string; from: number }> = {
    '1D': { resolution: '5', from: now - 86_400 },
    '1W': { resolution: '60', from: now - 7 * 86_400 },
    '1M': { resolution: 'D', from: now - 30 * 86_400 },
    '3M': { resolution: 'D', from: now - 90 * 86_400 },
    '1Y': { resolution: 'W', from: now - 365 * 86_400 },
  };
  return { ...map[tf], to: now };
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex gap-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'px-3 py-1 text-xs font-semibold rounded-md border transition-colors duration-150',
            value === opt
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700/60'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
