import { getIncomeStatement, getBalanceSheet, getCashFlow } from '@/lib/api/fmp';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const type = searchParams.get('type') ?? 'income';

  if (!symbol) return Response.json({ error: 'symbol required' }, { status: 400 });

  try {
    const s = symbol.toUpperCase();
    if (type === 'balance') return Response.json(await getBalanceSheet(s));
    if (type === 'cashflow') return Response.json(await getCashFlow(s));
    return Response.json(await getIncomeStatement(s));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
