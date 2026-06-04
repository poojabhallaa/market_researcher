import { getCompanyNews } from '@/lib/api/news';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  if (!symbol) return Response.json({ error: 'symbol required' }, { status: 400 });

  try {
    const data = await getCompanyNews(symbol.toUpperCase());
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
