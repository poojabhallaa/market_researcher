'use client';
import { useEffect } from 'react';
import { Bell, BellOff, Trash2, TrendingUp, TrendingDown, CheckCircle2, RotateCcw } from 'lucide-react';
import { useQuote } from '@/lib/hooks/useQuote';
import { useAlertsStore } from '@/lib/stores/alertsStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveDot } from '@/components/ui/LiveDot';
import type { PriceAlert } from '@/lib/types/alerts';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: PriceAlert;
  currency?: string;
}

export function AlertCard({ alert, currency = '$' }: AlertCardProps) {
  const { data: quote, isLoading } = useQuote(alert.symbol);
  const { toggleAlert, removeAlert, markTriggered, resetTrigger } = useAlertsStore();

  const price = quote?.price ?? null;
  const isTriggered = alert.triggeredAt !== null;
  const isAbove = alert.condition === 'above';

  // Evaluate the condition against the live price and fire once.
  useEffect(() => {
    if (!alert.active || isTriggered || price === null) return;
    const met = isAbove ? price >= alert.targetPrice : price <= alert.targetPrice;
    if (met) markTriggered(alert.id, new Date().toISOString());
  }, [price, alert.active, alert.targetPrice, alert.id, isAbove, isTriggered, markTriggered]);

  const distancePct =
    price !== null && price > 0
      ? ((alert.targetPrice - price) / price) * 100
      : null;

  const glow = isTriggered ? 'amber' : isAbove ? 'emerald' : 'red';

  return (
    <GlassCard className="p-4" glowColor={glow}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
              isTriggered
                ? 'bg-amber-500/10 text-amber-400'
                : isAbove
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {isTriggered ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : isAbove ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-zinc-100">{alert.symbol}</p>
              {alert.active && !isTriggered && <LiveDot />}
            </div>
            <p className="text-xs text-zinc-500 truncate max-w-[160px]">{alert.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isTriggered ? (
            <button
              onClick={() => resetTrigger(alert.id)}
              className="p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors"
              aria-label="Re-arm alert"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => toggleAlert(alert.id)}
              className={cn(
                'p-1.5 transition-colors',
                alert.active ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-600 hover:text-zinc-400'
              )}
              aria-label={alert.active ? 'Pause alert' : 'Resume alert'}
            >
              {alert.active ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={() => removeAlert(alert.id)}
            className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
            aria-label="Delete alert"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-zinc-500">Target</p>
          <p className="text-base font-bold text-zinc-100">
            {isAbove ? '≥ ' : '≤ '}
            {currency}
            {alert.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Current</p>
          {isLoading && price === null ? (
            <p className="text-base font-bold text-zinc-600">—</p>
          ) : (
            <p className="text-base font-bold text-zinc-300">
              {currency}
              {(price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      {/* Status line */}
      <div className="mt-3 pt-3 border-t border-zinc-800/60">
        {isTriggered ? (
          <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Triggered {new Date(alert.triggeredAt as string).toLocaleString()}
          </p>
        ) : !alert.active ? (
          <p className="text-xs text-zinc-500">Paused</p>
        ) : distancePct !== null ? (
          <p className="text-xs text-zinc-500">
            {Math.abs(distancePct).toFixed(2)}% {distancePct >= 0 ? 'below' : 'above'} target
          </p>
        ) : (
          <p className="text-xs text-zinc-600">Watching live price…</p>
        )}
        {alert.note && <p className="text-xs text-zinc-600 mt-1 italic truncate">{alert.note}</p>}
      </div>
    </GlassCard>
  );
}
