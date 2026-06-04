import { AGENT_PROMPTS, GROUNDING_NOTE, type AgentType } from '@/lib/agents/prompts';
import { streamGeminiText, type ChatTurn } from '@/lib/api/gemini';

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages?: ChatTurn[];
    agentType?: AgentType;
  };

  const messages: ChatTurn[] = body.messages ?? [];
  const agentType: AgentType = body.agentType ?? 'financial';
  const system = `${AGENT_PROMPTS[agentType] ?? AGENT_PROMPTS.financial}\n\n${GROUNDING_NOTE}`;

  // Single grounded Gemini call — answer streams straight back into the chat.
  return streamGeminiText({ system, messages, search: true });
}
