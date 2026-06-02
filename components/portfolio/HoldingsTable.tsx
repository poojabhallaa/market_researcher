'use client';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuote } from '@/lib/hooks/useQuote';
import { usePortfolioStore } from '@/lib/stores/portfolioStore';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Holding } from '@/lib/types/portfolio';

function HoldingRow({ holding }: { holding: Holding }) {
  const { data: quote, isLoading } = useQuote(holding.symbol);
  const { removeHolding } = usePortfolioStore();

  const currentPrice = quote?.price ?? holding.avgCost;
  const marketValue = currentPrice * holding.quantity;
  const costBasis = holding.avgCost * holding.quantity;
  const pnl = marketValue - costBasis;
  const pnlPercent = ((pnl / costBasis) * 100);
  const isPositive = pnl >= 0;

  return (
    <tr className="border-b border-zinc-800/60 hover:bg-zinc-800/20 transition-colors group">
      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-zinc-100">{holding.symbol}</p>
          <p className="text-xs text-zinc-500 truncate max-w-[120px]">{holding.name}</p>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-zinc-300 text-right">{holding.quantity.toLocaleString()}</td>
      <td className="px-5 py-4 text-sm text-zinc-300 text-right">${holding.avgCost.toFixed(2)}</td>
      <td className="px-5 py-4 text-right">
        {isLoading ? (
          <Skeleton className="h-4 w-16 ml-auto" />
        ) : (
          <span className="text-sm font-medium text-zinc-100">${currentPrice.toFixed(2)}</span>
        )}
      </td>
      <td className="px-5 py-4 text-right">
        <AnimatedNumber value={marketValue} prefix="$" decimals={2} className="text-sm font-medium text-zinc-100" />
      </td>
      <td className="px-5 py-4 text-right">
        <div>
          <p className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
          </p>
          <p className={`text-xs ${isPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
            {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
          </p>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          )}
          <button
            onClick={() => removeHolding(holding.id)}
            className="ml-2 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface HoldingsTableProps {
  holdings: Holding[];
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  if (holdings.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-zinc-800/60">
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Asset</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Shares</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Avg Cost</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Price</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Market Value</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">P&L</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide"></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <HoldingRow key={h.id} holding={h} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
