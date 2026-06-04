'use client';
import { useQuery } from '@tanstack/react-query';
import type { Quote } from '@/lib/types/market';

// Twelve Data free tier = 8 credits/min and each symbol costs 1 credit, so we
// keep this list small and let the market page spend the rest of the budget.
const TICKERS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'SPY'];

function TickerItem({ quote }: { quote: Quote }) {
  const isUp = quote.changePercent >= 0;
  return (
    <span className="inline-flex items-center gap-2 px-4 border-r border-zinc-800/60 text-xs whitespace-nowrap">
      <span className="font-semibold text-zinc-300">{quote.symbol}</span>
      <span className="text-zinc-100">${quote.price.toFixed(2)}</span>
      <span className={isUp ? 'text-emerald-400' : 'text-red-400'}>
        {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%
      </span>
    </span>
  );
}

export function TickerBar() {
  // ONE batched Twelve Data request for every symbol — only the symbols whose
  // price could actually be fetched come back, so the ticker shows just those.
  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ['ticker-quotes'],
    queryFn: async () => {
      const r = await fetch(`/api/market/quotes?symbols=${TICKERS.join(',')}`);
      const d = await r.json();
      return Array.isArray(d) ? (d as Quote[]) : [];
    },
    // Refresh every 5 min so the periodic 5-credit burst rarely collides with
    // the market page's quote/candle requests inside the same minute.
    refetchInterval: 300_000,
    staleTime: 270_000,
  });

  return (
    <div className="overflow-hidden border-b border-zinc-800/60 bg-zinc-950/80 h-8 flex items-center">
      {quotes.length === 0 ? (
        <span className="px-4 text-xs text-zinc-600">Live prices loading…</span>
      ) : (
        <div className="flex animate-ticker">
          {[...quotes, ...quotes].map((q, i) => (
            <TickerItem key={`${q.symbol}-${i}`} quote={q} />
          ))}
        </div>
      )}
    </div>
  );
}
