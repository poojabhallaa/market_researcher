import { streamGeminiText } from '@/lib/api/gemini';

export const maxDuration = 60;

/**
 * Live "current market situation" briefing for a symbol, streamed from Gemini
 * with Google Search grounding. Pairs with Twelve Data's hard numbers on the
 * market page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get('symbol') ?? '').toUpperCase();
  if (!symbol) return new Response('symbol required', { status: 400 });

  const system = `You are a market analyst writing a short live briefing. You have live Google Search — use it for today's data.
Write a tight markdown briefing (max ~150 words) covering:
- **Today's move**: how ${symbol} is trading today and why.
- **Catalysts**: 1-2 recent news items or events driving it.
- **Broader market**: one line on overall market mood (indices, sentiment).
Be specific with numbers, name sources briefly, and stay concise.`;

  return streamGeminiText({
    system,
    search: true,
    messages: [{ role: 'user', content: `Give me the current market situation for ${symbol}.` }],
  });
}
