'use client';
import { useState } from 'react';
import { X, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { useAlertsStore } from '@/lib/stores/alertsStore';
import { StockSearch } from '@/components/markets/StockSearch';
import type { AlertCondition } from '@/lib/types/alerts';
import { cn } from '@/lib/utils';

interface CreateAlertModalProps {
  onClose: () => void;
  currency?: string;
}

export function CreateAlertModal({ onClose, currency = '$' }: CreateAlertModalProps) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [note, setNote] = useState('');
  const { addAlert } = useAlertsStore();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = parseFloat(targetPrice);
    if (!symbol || isNaN(target) || target <= 0) return;

    addAlert({
      symbol,
      name: name || symbol,
      condition,
      targetPrice: target,
      note: note.trim() || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800/60 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            New Price Alert
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Symbol</label>
            <StockSearch defaultValue={symbol} onSelect={(s) => setSymbol(s)} navigateTo={false} />
            {symbol && <p className="text-xs text-emerald-400 mt-1">Selected: {symbol}</p>}
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Company Name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Apple Inc."
              className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Alert me when price is</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-800/40 rounded-lg border border-zinc-700/40">
              {(['above', 'below'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium capitalize transition-colors',
                    condition === c
                      ? c === 'above'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {c === 'above' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Target Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{currency}</span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="200.00"
                min="0"
                step="any"
                required
                className="w-full pl-7 pr-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Take profit target"
              className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-zinc-700/40 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!symbol || !targetPrice}
              className="flex-1 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
