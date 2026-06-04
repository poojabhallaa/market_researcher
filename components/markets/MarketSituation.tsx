'use client';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveDot } from '@/components/ui/LiveDot';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Live AI briefing of the current market situation for a symbol, streamed from
 * Gemini (grounded with Google Search). Complements the Twelve Data numbers.
 */
export function MarketSituation({ symbol }: { symbol: string }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setText('');
    setStatus('loading');

    (async () => {
      try {
        const res = await fetch(`/api/market/situation?symbol=${symbol}`, {
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error('failed');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          if (!cancelled) setText(acc);
        }
        if (!cancelled) setStatus('done');
      } catch (err) {
        if (!cancelled && (err as Error).name !== 'AbortError') setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [symbol]);

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">AI Market Situation</h3>
        {status === 'loading' && <LiveDot color="emerald" />}
        <span className="ml-auto text-[10px] text-zinc-600 uppercase tracking-wide">Gemini · Live</span>
      </div>

      {text ? (
        <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{text}</p>
      ) : status === 'error' ? (
        <p className="text-sm text-zinc-500">Couldn&apos;t load the market briefing right now.</p>
      ) : (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      )}
    </GlassCard>
  );
}
