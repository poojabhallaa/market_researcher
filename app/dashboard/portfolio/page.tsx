'use client';
import { useState } from 'react';
import { Plus, PieChart } from 'lucide-react';
import { usePortfolioStore } from '@/lib/stores/portfolioStore';
import { useQueries } from '@tanstack/react-query';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { PortfolioChart } from '@/components/portfolio/PortfolioChart';
import { AddHoldingModal } from '@/components/portfolio/AddHoldingModal';
import type { Quote } from '@/lib/types/market';

export default function PortfolioPage() {
  const [showModal, setShowModal] = useState(false);
  const { holdings } = usePortfolioStore();

  const quoteQueries = useQueries({
    queries: holdings.map((h) => ({
      queryKey: ['quote', h.symbol],
      queryFn: () => fetch(`/api/market/quote?symbol=${h.symbol}`).then((r): Promise<Quote> => r.json()),
      staleTime: 30_000,
      refetchInterval: 30_000,
    })),
  });

  const holdingsWithPrices = holdings.map((h, i) => ({
    ...h,
    currentPrice: quoteQueries[i]?.data?.price ?? h.avgCost,
  }));

  const totalValue = holdingsWithPrices.reduce((s, h) => s + h.currentPrice * h.quantity, 0);
  const totalCost = holdings.reduce((s, h) => s + h.avgCost * h.quantity, 0);
  const unrealizedPnL = totalValue - totalCost;

  const chartData = holdingsWithPrices.map((h) => ({
    name: h.symbol,
    value: h.currentPrice * h.quantity,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <PieChart className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Portfolio</h1>
            <p className="text-xs text-zinc-500">{holdings.length} positions tracked</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Holding
        </button>
      </div>

      {holdings.length > 0 ? (
        <>
          <PortfolioSummary
            totalValue={totalValue}
            totalCost={totalCost}
            unrealizedPnL={unrealizedPnL}
            holdingCount={holdings.length}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HoldingsTable holdings={holdingsWithPrices} />
            </div>
            <PortfolioChart data={chartData} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
            <PieChart className="w-8 h-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-300">No holdings yet</h2>
          <p className="text-sm text-zinc-500 text-center max-w-sm">
            Start tracking your portfolio by adding your first holding. Live prices will update automatically.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Holding
          </button>
        </div>
      )}

      {showModal && <AddHoldingModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
