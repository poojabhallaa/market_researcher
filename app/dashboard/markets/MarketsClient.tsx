'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuote } from '@/lib/hooks/useQuote';
import { StockSearch } from '@/components/markets/StockSearch';
import { PriceChart } from '@/components/markets/PriceChart';
import { TimeframeSelector, getTimeframeParams, type Timeframe } from '@/components/markets/TimeframeSelector';
import { CompanyOverview } from '@/components/markets/CompanyOverview';
import { MarketStats } from '@/components/markets/MarketStats';
import { MarketNewsFeed } from '@/components/markets/MarketNewsFeed';
import { MarketSituation } from '@/components/markets/MarketSituation';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { LiveDot } from '@/components/ui/LiveDot';

export function MarketsClient({ defaultSymbol }: { defaultSymbol: string }) {
  const router = useRouter();
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const { data: quote } = useQuote(symbol);

  const { resolution, from, to } = getTimeframeParams(timeframe);
  const isUp = (quote?.changePercent ?? 0) >= 0;

  function handleSymbolChange(s: string) {
    setSymbol(s);
    router.push(`/dashboard/markets?symbol=${s}`, { scroll: false } as Parameters<typeof router.push>[1]);
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-48 max-w-sm">
          <StockSearch
            defaultValue={symbol}
            onSelect={handleSymbolChange}
            navigateTo={false}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-zinc-100">{symbol}</span>
          {quote && typeof quote.price === 'number' && (
            <div className="flex items-center gap-2">
              <LiveDot color={isUp ? 'emerald' : 'red'} />
              <span className="text-xl font-bold text-zinc-100">
                <AnimatedNumber value={quote.price} prefix="$" decimals={2} duration={300} />
              </span>
              <span className={`text-sm font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? '+' : ''}{(quote.changePercent ?? 0).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-4">
        <PriceChart
          symbol={symbol}
          resolution={resolution}
          from={from}
          to={to}
          previousClose={quote?.previousClose}
        />
      </div>

      {/* Timeframe selector */}
      <TimeframeSelector value={timeframe} onChange={setTimeframe} />

      {/* AI briefing of the live market situation (Gemini, grounded) */}
      <MarketSituation symbol={symbol} />

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <CompanyOverview symbol={symbol} />
          <MarketStats symbol={symbol} />
        </div>
        <MarketNewsFeed symbol={symbol} />
      </div>
    </div>
  );
}
