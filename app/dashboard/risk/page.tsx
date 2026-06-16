'use client';
import { useState, useCallback, useRef } from 'react';
import { Shield, RefreshCw, BrainCircuit, Send, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePortfolioStore } from '@/lib/stores/portfolioStore';
import { RiskScoreGauge } from '@/components/risk/RiskScoreGauge';
import { RiskMetricsGrid } from '@/components/risk/RiskMetricsGrid';
import { CorrelationMatrix } from '@/components/risk/CorrelationMatrix';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { RiskMetrics, CorrelationMatrix as CorrelationMatrixType } from '@/lib/types/risk';
import type { Holding } from '@/lib/types/portfolio';
import Link from 'next/link';

const PRESET_QUESTIONS = [
  'What is my biggest risk factor right now?',
  'How can I reduce my concentration risk?',
  'Am I over-exposed to market downturns?',
  'How does my portfolio compare to a balanced benchmark?',
];

function AIRiskAnalysis({
  holdings,
  metrics,
}: {
  holdings: Holding[];
  metrics?: RiskMetrics;
}) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const runAnalysis = useCallback(
    async (q: string) => {
      if (!q.trim() || isStreaming) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setResponse('');
      setIsStreaming(true);

      try {
        const res = await fetch('/api/risk/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ holdings, metrics, question: q }),
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
    },
    [holdings, metrics, isStreaming]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis(question);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-zinc-200">AI Risk Analysis</h3>
        <span className="text-xs text-zinc-600 ml-1">Powered by Gemini</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => {
              setQuestion(q);
              runAnalysis(q);
            }}
            disabled={isStreaming}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-3 h-3" />
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your portfolio risk (e.g. What is my downside risk in a market crash?)"
          className="flex-1 bg-zinc-800/60 border border-zinc-700/40 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40"
          disabled={isStreaming}
        />
        <button
          type="submit"
          disabled={isStreaming || !question.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          {isStreaming ? 'Analyzing…' : 'Analyze'}
        </button>
      </form>

      {response && (
        <div className="mt-4 rounded-lg bg-zinc-800/40 border border-zinc-700/30 p-4">
          <p className="text-xs text-zinc-500 mb-2 font-medium">AI Analysis</p>
          <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {response}
            {isStreaming && <span className="inline-block w-1.5 h-4 bg-emerald-400 animate-pulse ml-0.5 align-middle" />}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default function RiskPage() {
  const { holdings } = usePortfolioStore();
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery<{
    metrics: RiskMetrics;
    correlationMatrix: CorrelationMatrixType;
  }>({
    queryKey: ['risk', holdings.map((h) => h.symbol).join(',')],
    queryFn: () =>
      fetch('/api/risk/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings }),
      }).then((r) => r.json()),
    enabled: enabled && holdings.length >= 1,
    staleTime: 5 * 60_000,
  });

  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
          <Shield className="w-8 h-8 text-zinc-600" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-300">No holdings to analyze</h2>
        <p className="text-sm text-zinc-500 text-center max-w-sm">
          Add holdings to your portfolio first to see risk metrics, correlation analysis, and VaR calculations.
        </p>
        <Link href="/dashboard/portfolio" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
          Go to Portfolio →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Risk Analysis</h1>
            <p className="text-xs text-zinc-500">{holdings.length} positions · 90-day lookback</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!enabled ? (
            <button
              onClick={() => setEnabled(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
            >
              Compute Risk Metrics
            </button>
          ) : (
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 border border-zinc-700/40 text-zinc-400 hover:text-zinc-200 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {!enabled && (
        <GlassCard className="p-8 text-center">
          <p className="text-zinc-500 text-sm mb-2">
            Click &ldquo;Compute Risk Metrics&rdquo; to analyze portfolio risk using 90-day historical data.
          </p>
          <p className="text-zinc-600 text-xs">
            Requires FINNHUB_API_KEY to fetch historical price data.
          </p>
        </GlassCard>
      )}

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      )}

      {isError && (
        <GlassCard className="p-6 text-center" glowColor="red">
          <p className="text-red-400 text-sm">Failed to compute risk metrics. Check that FINNHUB_API_KEY is configured.</p>
        </GlassCard>
      )}

      {data && !isLoading && (
        <>
          <GlassCard className="p-6">
            <div className="flex items-start gap-8 flex-wrap">
              <RiskScoreGauge score={data.metrics.overallScore} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-zinc-300 mb-1">Overall Risk Assessment</h3>
                <p className="text-xs text-zinc-500 max-w-md">
                  Computed from annualized volatility ({data.metrics.volatility.toFixed(1)}%),
                  max drawdown ({data.metrics.maxDrawdown.toFixed(1)}%),
                  concentration ({data.metrics.concentration.toFixed(1)}%),
                  and beta vs SPY ({data.metrics.beta.toFixed(2)}).
                </p>
              </div>
            </div>
          </GlassCard>

          <RiskMetricsGrid metrics={data.metrics} />

          {data.correlationMatrix.symbols.length > 1 && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">Correlation Matrix (90-day)</h3>
              <p className="text-xs text-zinc-500 mb-4">
                Green = highly correlated. Red = inversely correlated. Low correlation between holdings reduces portfolio risk.
              </p>
              <CorrelationMatrix data={data.correlationMatrix} />
            </GlassCard>
          )}
        </>
      )}

      <AIRiskAnalysis holdings={holdings} metrics={data?.metrics} />
    </div>
  );
}
