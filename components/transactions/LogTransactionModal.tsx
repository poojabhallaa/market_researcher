'use client';
import { useState } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import { usePortfolioStore } from '@/lib/stores/portfolioStore';
import { StockSearch } from '@/components/markets/StockSearch';
import { cn } from '@/lib/utils';

interface LogTransactionModalProps {
  onClose: () => void;
  currency?: string;
}

export function LogTransactionModal({ onClose, currency = '$' }: LogTransactionModalProps) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const { addTransaction } = usePortfolioStore();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const px = parseFloat(price);
    if (!symbol || isNaN(qty) || isNaN(px) || qty <= 0 || px <= 0) return;

    addTransaction({
      symbol,
      name: name || symbol,
      type,
      quantity: qty,
      price: px,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    });
    onClose();
  }

  const total = (parseFloat(quantity || '0') || 0) * (parseFloat(price || '0') || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800/60 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-sky-400" />
            Record Transaction
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Buy / Sell toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-800/40 rounded-lg border border-zinc-700/40">
            {(['buy', 'sell'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'py-2 rounded-md text-sm font-medium capitalize transition-colors',
                  type === t
                    ? t === 'buy'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {t}
              </button>
            ))}
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                min="0"
                step="any"
                required
                className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Price / Share</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150.00"
                min="0"
                step="any"
                required
                className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {total > 0 && (
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-700/40">
              <p className="text-xs text-zinc-500">Total {type === 'buy' ? 'cost' : 'proceeds'}</p>
              <p className="text-sm font-semibold text-zinc-100">
                {currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}

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
              disabled={!symbol}
              className="flex-1 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
