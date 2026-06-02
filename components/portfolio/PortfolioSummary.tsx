'use client';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { GlassCard } from '@/components/ui/GlassCard';

interface PortfolioSummaryProps {
  totalValue: number;
  totalCost: number;
  unrealizedPnL: number;
  holdingCount: number;
}

export function PortfolioSummary({ totalValue, totalCost, unrealizedPnL, holdingCount }: PortfolioSummaryProps) {
  const isPositive = unrealizedPnL >= 0;
  const pnlPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Value</p>
        </div>
        <AnimatedNumber value={totalValue} prefix="$" decimals={2} className="text-2xl font-bold text-zinc-100" />
        <p className="text-xs text-zinc-500 mt-1">{holdingCount} positions</p>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-zinc-400" />
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Cost</p>
        </div>
        <AnimatedNumber value={totalCost} prefix="$" decimals={2} className="text-2xl font-bold text-zinc-100" />
        <p className="text-xs text-zinc-500 mt-1">Average cost basis</p>
      </GlassCard>

      <GlassCard className="p-5" glowColor={isPositive ? 'emerald' : 'red'}>
        <div className="flex items-center gap-2 mb-2">
          {isPositive
            ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            : <ArrowDownRight className="w-4 h-4 text-red-400" />
          }
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Unrealized P&L</p>
        </div>
        <AnimatedNumber
          value={Math.abs(unrealizedPnL)}
          prefix={isPositive ? '+$' : '-$'}
          decimals={2}
          className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
        />
        <p className={`text-xs mt-1 font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}% return
        </p>
      </GlassCard>
    </div>
  );
}
