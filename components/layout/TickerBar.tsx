'use client';
import { useQuery } from '@tanstack/react-query';
import type { Quote } from '@/lib/types/market';

const TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'SPY'];

function TickerItem({ symbol }: { symbol: string }) {
  const { data } = useQuery<Quote>({
    queryKey: ['quote', symbol],
    queryFn: () => fetch(`/api/market/quote?symbol=${symbol}`).then((r) => r.json()),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const price = data?.price;
  const change = data?.changePercent;
  const isUp = (change ?? 0) >= 0;

  return (
    <span className="inline-flex items-center gap-2 px-4 border-r border-zinc-800/60 text-xs whitespace-nowrap">
      <span className="font-semibold text-zinc-300">{symbol}</span>
      {price !== undefined ? (
        <>
          <span className="text-zinc-100">${price.toFixed(2)}</span>
          <span className={isUp ? 'text-emerald-400' : 'text-red-400'}>
            {isUp ? '+' : ''}{(change ?? 0).toFixed(2)}%
          </span>
        </>
      ) : (
        <span className="text-zinc-600">—</span>
      )}
    </span>
  );
}

export function TickerBar() {
  const all = [...TICKERS, ...TICKERS];

  return (
    <div className="overflow-hidden border-b border-zinc-800/60 bg-zinc-950/80 h-8 flex items-center">
      <div className="flex animate-ticker">
        {all.map((symbol, i) => (
          <TickerItem key={`${symbol}-${i}`} symbol={symbol} />
        ))}
      </div>
    </div>
  );
}
