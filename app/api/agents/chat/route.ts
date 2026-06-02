import { streamText, stepCountIs, type ModelMessage } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { AGENT_PROMPTS, type AgentType } from '@/lib/agents/prompts';
import { financialTools, newsTools, allTools } from '@/lib/agents/tools';

export const maxDuration = 60;

const AGENT_TOOLS: Record<AgentType, object> = {
  financial: financialTools,
  sentiment: newsTools,
  forecasting: { ...financialTools },
  strategy: allTools,
};

export async function POST(request: Request) {
  const body = await request.json() as {
    messages?: ModelMessage[];
    agentType?: AgentType;
  };

  const messages: ModelMessage[] = body.messages ?? [];
  const agentType: AgentType = body.agentType ?? 'financial';

  const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY });
  const tools = AGENT_TOOLS[agentType] ?? financialTools;

  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4.6'),
    system: AGENT_PROMPTS[agentType],
    messages,
    tools: tools as Parameters<typeof streamText>[0]['tools'],
    stopWhen: stepCountIs(10),
  });

  return result.toTextStreamResponse();
}
