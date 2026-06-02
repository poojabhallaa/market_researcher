import { searchSymbol } from '@/lib/api/finnhub';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  if (!q) return Response.json([]);

  try {
    const data = await searchSymbol(q);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
