'use client';
import { useMemo, useState } from 'react';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, Trash2, Search } from 'lucide-react';
import { usePortfolioStore } from '@/lib/stores/portfolioStore';
import { useProfileStore, CURRENCY_SYMBOLS } from '@/lib/stores/profileStore';
import { LogTransactionModal } from '@/components/transactions/LogTransactionModal';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'buy' | 'sell';

export default function TransactionsPage() {
  const { transactions, removeTransaction } = usePortfolioStore();
  const { profile } = useProfileStore();
  const currency = CURRENCY_SYMBOLS[profile.currency];

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    const bought = transactions
      .filter((t) => t.type === 'buy')
      .reduce((s, t) => s + t.price * t.quantity, 0);
    const sold = transactions
      .filter((t) => t.type === 'sell')
      .reduce((s, t) => s + t.price * t.quantity, 0);
    return { bought, sold, net: bought - sold, count: transactions.length };
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    return transactions.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (q && !t.symbol.toUpperCase().includes(q) && !t.name.toUpperCase().includes(q))
        return false;
      return true;
    });
  }, [transactions, filter, search]);

  const fmt = (n: number) =>
    `${currency}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Transactions</h1>
            <p className="text-xs text-zinc-500">{transactions.length} records · full trade history</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Transaction
        </button>
      </div>

      {transactions.length > 0 ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Trades" value={String(stats.count)} glowColor="cyan" />
            <StatCard label="Total Bought" value={fmt(stats.bought)} glowColor="emerald" valueClass="text-emerald-400" />
            <StatCard label="Total Sold" value={fmt(stats.sold)} glowColor="red" valueClass="text-red-400" />
            <StatCard
              label="Net Invested"
              value={fmt(Math.abs(stats.net))}
              glowColor="violet"
              valueClass={stats.net >= 0 ? 'text-zinc-100' : 'text-amber-400'}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800/60 rounded-lg w-fit">
              {(['all', 'buy', 'sell'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors',
                    filter === f ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative sm:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by symbol..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800/60 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Asset</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Quantity</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Price</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Total</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const isBuy = t.type === 'buy';
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/20 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
                              isBuy
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            )}
                          >
                            {isBuy ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {isBuy ? 'Buy' : 'Sell'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-zinc-100">{t.symbol}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-[140px]">{t.name}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-zinc-300 text-right">
                          {t.quantity.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-sm text-zinc-300 text-right">{fmt(t.price)}</td>
                        <td className="px-5 py-4 text-sm font-medium text-zinc-100 text-right">
                          {fmt(t.price * t.quantity)}
                        </td>
                        <td className="px-5 py-4 text-sm text-zinc-500 text-right whitespace-nowrap">{t.date}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => removeTransaction(t.id)}
                            className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-zinc-500">
                No transactions match this filter.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-300">No transactions yet</h2>
          <p className="text-sm text-zinc-500 text-center max-w-sm">
            Buys you make from your portfolio appear here automatically. You can also record trades
            manually to keep a complete history.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record Your First Transaction
          </button>
        </div>
      )}

      {showModal && <LogTransactionModal onClose={() => setShowModal(false)} currency={currency} />}
    </div>
  );
}

function StatCard({
  label,
  value,
  glowColor,
  valueClass = 'text-zinc-100',
}: {
  label: string;
  value: string;
  glowColor: 'emerald' | 'cyan' | 'violet' | 'amber' | 'red';
  valueClass?: string;
}) {
  return (
    <GlassCard className="p-4" glowColor={glowColor}>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={cn('text-lg font-bold', valueClass)}>{value}</p>
    </GlassCard>
  );
}
