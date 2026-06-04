import { getQuotes } from '@/lib/api/twelvedata';

/**
 * Batch quotes for the ticker bar. One Twelve Data request for every symbol,
 * returning only the ones whose price could actually be fetched.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = (searchParams.get('symbols') ?? '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length === 0) return Response.json([]);

  try {
    const data = await getQuotes(symbols);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
