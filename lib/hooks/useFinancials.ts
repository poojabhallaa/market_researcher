'use client';
import { useQuery } from '@tanstack/react-query';
import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '@/lib/types/market';

type FinancialType = 'income' | 'balance' | 'cashflow';

type FinancialData<T extends FinancialType> =
  T extends 'income' ? IncomeStatement[] :
  T extends 'balance' ? BalanceSheet[] :
  CashFlowStatement[];

export function useFinancials<T extends FinancialType>(symbol: string, type: T) {
  return useQuery<FinancialData<T>>({
    queryKey: ['financials', symbol, type],
    queryFn: () =>
      fetch(`/api/financials?symbol=${symbol}&type=${type}`).then((r) => r.json()),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60_000,
  });
}
