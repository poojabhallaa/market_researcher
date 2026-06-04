import { GROUNDING_NOTE } from '@/lib/agents/prompts';
import { streamGeminiText } from '@/lib/api/gemini';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { symbol } = (await request.json()) as { symbol?: string };

  if (!symbol) {
    return Response.json({ error: 'symbol required' }, { status: 400 });
  }

  const ticker = symbol.toUpperCase();
  const system = `You are a comprehensive financial analyst. Analyze companies thoroughly and provide structured insights.\n${GROUNDING_NOTE}`;

  return streamGeminiText({
    system,
    search: true,
    messages: [
      {
        role: 'user',
        content: `Provide a comprehensive analysis of ${ticker}. Search for their latest price, recent news, and most recent reported financials, then give me:
1. Executive Summary (3 sentences)
2. Key Financial Metrics (revenue growth, margins, debt levels)
3. Top 3 Strengths
4. Top 3 Risks
5. 12-Month Outlook and recommendation`,
      },
    ],
  });
}
