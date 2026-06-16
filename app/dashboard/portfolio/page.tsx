'use client';
import { useState, useCallback, useRef } from 'react';
import { Plus, PieChart, BrainCircuit, Sparkles } from 'lucide-react';
import { usePortfolioStore } from '@/lib/stores/portfolioStore';
import { useQueries } from '@tanstack/react-query';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { PortfolioChart } from '@/components/portfolio/PortfolioChart';
import { AddHoldingModal } from '@/components/portfolio/AddHoldingModal';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Quote } from '@/lib/types/market';

interface HoldingWithPrice {
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
}

function AIPortfolioAdvice({ holdings }: { holdings: HoldingWithPrice[] }) {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const runAnalysis = useCallback(async () => {
    if (isStreaming) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setResponse('');
    setIsStreaming(true);
    setHasRun(true);

    try {
      const res = await fetch('/api/portfolio/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setResponse(accumulated);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setResponse(`Error: ${err instanceof Error ? err.message : 'Something went wrong'}`);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [holdings, isStreaming]);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-200">AI Portfolio Advice</h3>
          <span className="text-xs text-zinc-600">Powered by Gemini</span>
        </div>
        <button
          onClick={runAnalysis}
          disabled={isStreaming}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isStreaming ? 'Analyzing…' : hasRun ? 'Refresh Analysis' : 'Analyze Portfolio'}
        </button>
      </div>

      {!hasRun && (
        <p className="text-sm text-zinc-500">
          Click &ldquo;Analyze Portfolio&rdquo; to get AI-powered advice on your current holdings — whether they&apos;re performing well and what actions to consider.
        </p>
      )}

      {hasRun && (
        <div className="rounded-lg bg-zinc-800/40 border border-zinc-700/30 p-4">
          {response ? (
            <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {response}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-emerald-400 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Generating analysis…
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

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

          <AIPortfolioAdvice holdings={holdingsWithPrices} />
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
