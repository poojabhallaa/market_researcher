import { streamText, stepCountIs, type ModelMessage } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { allTools } from '@/lib/agents/tools';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { symbol } = await request.json() as { symbol: string };

  if (!symbol) {
    return Response.json({ error: 'symbol required' }, { status: 400 });
  }

  const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY });

  const messages: ModelMessage[] = [
    {
      role: 'user',
      content: `Provide a comprehensive analysis of ${symbol.toUpperCase()}.
Fetch their financial statements and recent news, then give me:
1. Executive Summary (3 sentences)
2. Key Financial Metrics (revenue growth, margins, debt levels)
3. Top 3 Strengths
4. Top 3 Risks
5. 12-Month Outlook and recommendation`,
    },
  ];

  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4.6'),
    system: `You are a comprehensive financial analyst. Analyze companies thoroughly and provide structured insights.
Use available tools to gather financial data and news before responding.
Always structure your response with clear sections: Executive Summary, Key Metrics, Strengths, Risks, and Outlook.`,
    messages,
    tools: allTools as Parameters<typeof streamText>[0]['tools'],
    stopWhen: stepCountIs(10),
  });

  return result.toTextStreamResponse();
}
