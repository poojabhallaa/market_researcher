'use client';
import { useQuery } from '@tanstack/react-query';
import type { NewsArticle } from '@/lib/types/market';

export function useCompanyNews(symbol: string) {
  return useQuery<NewsArticle[]>({
    queryKey: ['news', symbol],
    queryFn: () => fetch(`/api/market/news?symbol=${symbol}`).then((r) => r.json()),
    enabled: !!symbol,
    staleTime: 30 * 60_000,
  });
}
