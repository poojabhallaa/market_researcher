'use client';
import { useMemo, useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { useAlertsStore } from '@/lib/stores/alertsStore';
import { useProfileStore, CURRENCY_SYMBOLS } from '@/lib/stores/profileStore';
import { CreateAlertModal } from '@/components/alerts/CreateAlertModal';
import { AlertCard } from '@/components/alerts/AlertCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'active' | 'triggered';

export default function AlertsPage() {
  const { alerts } = useAlertsStore();
  const { profile } = useProfileStore();
  const currency = CURRENCY_SYMBOLS[profile.currency];

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const triggered = alerts.filter((a) => a.triggeredAt !== null).length;
    const active = alerts.filter((a) => a.active && a.triggeredAt === null).length;
    return { triggered, active, total: alerts.length };
  }, [alerts]);

  const visible = useMemo(() => {
    if (filter === 'active') return alerts.filter((a) => a.active && a.triggeredAt === null);
    if (filter === 'triggered') return alerts.filter((a) => a.triggeredAt !== null);
    return alerts;
  }, [alerts, filter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Price Alerts</h1>
            <p className="text-xs text-zinc-500">
              {counts.active} active · {counts.triggered} triggered
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Alert
        </button>
      </div>

      {alerts.length > 0 ? (
        <>
          {/* Filter tabs */}
          <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800/60 rounded-lg w-fit">
            {([
              ['all', `All (${counts.total})`],
              ['active', `Active (${counts.active})`],
              ['triggered', `Triggered (${counts.triggered})`],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-xs font-medium transition-colors',
                  filter === key ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {visible.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {visible.map((a) => (
                <AlertCard key={a.id} alert={a} currency={currency} />
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <p className="text-sm text-zinc-500">No {filter} alerts.</p>
            </GlassCard>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
            <Bell className="w-8 h-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-300">No alerts yet</h2>
          <p className="text-sm text-zinc-500 text-center max-w-sm">
            Set price targets and we&apos;ll watch the live market for you. Alerts fire automatically
            when a stock crosses your threshold.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Alert
          </button>
        </div>
      )}

      {showModal && <CreateAlertModal onClose={() => setShowModal(false)} currency={currency} />}
    </div>
  );
}
