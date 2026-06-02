import { GlassCard } from '@/components/ui/GlassCard';
import type { RiskMetrics } from '@/lib/types/risk';

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  color?: string;
}

function MetricCard({ label, value, description, color = 'text-zinc-100' }: MetricCardProps) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-xl font-bold mb-1 ${color}`}>{value}</p>
      <p className="text-xs text-zinc-600">{description}</p>
    </GlassCard>
  );
}

export function RiskMetricsGrid({ metrics }: { metrics: RiskMetrics }) {
  const sharpeColor = metrics.sharpeRatio >= 1 ? 'text-emerald-400' : metrics.sharpeRatio >= 0 ? 'text-amber-400' : 'text-red-400';
  const volColor = metrics.volatility < 20 ? 'text-emerald-400' : metrics.volatility < 40 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <MetricCard
        label="Volatility (Ann.)"
        value={`${metrics.volatility.toFixed(1)}%`}
        description="Annualized std deviation"
        color={volColor}
      />
      <MetricCard
        label="Sharpe Ratio"
        value={metrics.sharpeRatio.toFixed(2)}
        description="Risk-adjusted return"
        color={sharpeColor}
      />
      <MetricCard
        label="Beta"
        value={metrics.beta.toFixed(2)}
        description="vs S&P 500 (SPY)"
        color={metrics.beta > 1.2 ? 'text-amber-400' : 'text-zinc-100'}
      />
      <MetricCard
        label="95% VaR"
        value={`$${metrics.valueAtRisk.toFixed(0)}`}
        description="Daily value at risk"
        color="text-red-400"
      />
      <MetricCard
        label="Max Drawdown"
        value={`${metrics.maxDrawdown.toFixed(1)}%`}
        description="Largest peak-to-trough"
        color={metrics.maxDrawdown > 30 ? 'text-red-400' : 'text-amber-400'}
      />
      <MetricCard
        label="Concentration"
        value={`${metrics.concentration.toFixed(1)}%`}
        description="Largest single holding"
        color={metrics.concentration > 50 ? 'text-amber-400' : 'text-emerald-400'}
      />
    </div>
  );
}
