'use client';
import { useQuery } from '@tanstack/react-query';
import type { Quote } from '@/lib/types/market';

async function fetchQuote(symbol: string): Promise<Quote | null> {
  const res = await fetch(`/api/market/quote?symbol=${symbol}`);
  const data = await res.json();
  if (!res.ok || typeof data?.price !== 'number') return null;
  return data as Quote;
}

export function useQuote(symbol: string) {
  return useQuery<Quote | null>({
    queryKey: ['quote', symbol],
    queryFn: () => fetchQuote(symbol),
    // Twelve Data free tier is 8 credits/min; poll once a minute to stay within it.
    refetchInterval: 60_000,
    enabled: !!symbol,
    staleTime: 50_000,
  });
}
