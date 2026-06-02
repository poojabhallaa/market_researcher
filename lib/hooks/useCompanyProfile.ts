'use client';
import { useQuery } from '@tanstack/react-query';
import type { CompanyProfile } from '@/lib/types/market';

export function useCompanyProfile(symbol: string) {
  return useQuery<CompanyProfile>({
    queryKey: ['profile', symbol],
    queryFn: () => fetch(`/api/market/profile?symbol=${symbol}`).then((r) => r.json()),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60_000,
  });
}
