import { getCandles } from '@/lib/api/finnhub';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const resolution = searchParams.get('resolution') ?? 'D';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!symbol || !from || !to) {
    return Response.json({ error: 'symbol, from, to required' }, { status: 400 });
  }

  try {
    const data = await getCandles(symbol.toUpperCase(), resolution, Number(from), Number(to));
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
