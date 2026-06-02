'use client';
import { useState, useRef } from 'react';
import { Search, Loader2, Zap } from 'lucide-react';
import { useQuote } from '@/lib/hooks/useQuote';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { LiveDot } from '@/components/ui/LiveDot';
import { GlassCard } from '@/components/ui/GlassCard';

export function CompanyAnalysisPanel() {
  const [symbol, setSymbol] = useState('');
  const [submittedSymbol, setSubmittedSymbol] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { data: quote } = useQuote(submittedSymbol);
  const abortRef = useRef<AbortController | null>(null);

  async function handleAnalyze() {
    if (!symbol.trim() || isAnalyzing) return;
    const sym = symbol.trim().toUpperCase();
    setSubmittedSymbol(sym);
    setAnalysis('');
    setIsAnalyzing(true);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/agents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: sym }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) throw new Error('Analysis failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setAnalysis(text);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setAnalysis('Analysis failed. Please check your API key and try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  const isUp = (quote?.changePercent ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          Company Analysis
        </h3>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="AAPL, TSLA, NVDA..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !symbol.trim()}
            className="px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
          </button>
        </div>
      </GlassCard>

      {submittedSymbol && quote && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-zinc-100">{submittedSymbol}</span>
            <LiveDot color={isUp ? 'emerald' : 'red'} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-100">
              <AnimatedNumber value={quote.price} prefix="$" decimals={2} duration={300} />
            </span>
            <span className={`text-sm font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%
            </span>
          </div>
        </GlassCard>
      )}

      {(analysis || isAnalyzing) && (
        <GlassCard className="p-4 flex-1 overflow-y-auto">
          <div className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {analysis}
            {isAnalyzing && (
              <span className="inline-block w-2 h-4 bg-emerald-400/70 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
