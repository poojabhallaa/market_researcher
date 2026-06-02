'use client';
import { useQuery } from '@tanstack/react-query';
import type { Candle } from '@/lib/types/market';

export function useCandles(symbol: string, resolution: string, from: number, to: number) {
  return useQuery<Candle[]>({
    queryKey: ['candles', symbol, resolution, from, to],
    queryFn: () =>
      fetch(`/api/market/candles?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`)
        .then((r) => r.json()),
    enabled: !!symbol && !!from && !!to,
    staleTime: 5 * 60_000,
  });
}
