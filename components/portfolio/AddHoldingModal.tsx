'use client';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { usePortfolioStore } from '@/lib/stores/portfolioStore';
import { StockSearch } from '@/components/markets/StockSearch';

interface AddHoldingModalProps {
  onClose: () => void;
}

export function AddHoldingModal({ onClose }: AddHoldingModalProps) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const { addHolding, addTransaction } = usePortfolioStore();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol || !quantity || !avgCost) return;

    const qty = parseFloat(quantity);
    const cost = parseFloat(avgCost);
    if (isNaN(qty) || isNaN(cost) || qty <= 0 || cost <= 0) return;

    addHolding({ symbol, name: name || symbol, quantity: qty, avgCost: cost });
    addTransaction({
      symbol,
      name: name || symbol,
      type: 'buy',
      quantity: qty,
      price: cost,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800/60 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Add Holding
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Symbol</label>
            <StockSearch
              defaultValue={symbol}
              onSelect={(s) => setSymbol(s)}
              navigateTo={false}
            />
            {symbol && (
              <p className="text-xs text-emerald-400 mt-1">Selected: {symbol}</p>
            )}
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
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Quantity (shares)</label>
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
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Avg Cost / Share</label>
              <input
                type="number"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                placeholder="150.00"
                min="0"
                step="any"
                required
                className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {symbol && quantity && avgCost && (
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-700/40">
              <p className="text-xs text-zinc-500">Total cost basis</p>
              <p className="text-sm font-semibold text-zinc-100">
                ${(parseFloat(quantity || '0') * parseFloat(avgCost || '0')).toFixed(2)}
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
              Add Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
