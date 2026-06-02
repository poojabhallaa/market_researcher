'use client';
import { useQuote } from '@/lib/hooks/useQuote';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-zinc-800/40 rounded-lg">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  );
}

function formatVol(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

export function MarketStats({ symbol }: { symbol: string }) {
  const { data: quote, isLoading } = useQuote(symbol);

  if (!quote || typeof quote.price !== 'number') return <Skeleton className="h-32 w-full rounded-xl" />;

  return (
    <GlassCard className="p-4">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Trading Stats</h3>
      <div className="grid grid-cols-2 gap-2">
        <StatCell label="Day High" value={`$${quote.high.toFixed(2)}`} />
        <StatCell label="Day Low" value={`$${quote.low.toFixed(2)}`} />
        <StatCell label="Open" value={`$${quote.open.toFixed(2)}`} />
        <StatCell label="Prev Close" value={`$${quote.previousClose.toFixed(2)}`} />
        {quote.volume > 0 && <StatCell label="Volume" value={formatVol(quote.volume)} />}
        <StatCell
          label="Change"
          value={`${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}`}
        />
      </div>
    </GlassCard>
  );
}
