import { Suspense } from 'react';
import { MarketsClient } from './MarketsClient';
import MarketsLoading from './loading';

export const metadata = { title: 'Markets · FinanceAI' };

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string }>;
}) {
  const { symbol = 'AAPL' } = await searchParams;
  return (
    <Suspense fallback={<MarketsLoading />}>
      <MarketsClient defaultSymbol={symbol.toUpperCase()} />
    </Suspense>
  );
}
