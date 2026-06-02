import { AgentBadge } from './AgentBadge';
import type { ChatMessage as ChatMessageType } from '@/lib/hooks/useStreamingChat';
import type { AgentType } from '@/lib/agents/prompts';

interface ChatMessageProps {
  message: ChatMessageType;
  agentType: AgentType;
}

export function ChatMessage({ message, agentType }: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm bg-emerald-500/10 border border-emerald-500/20 text-sm text-zinc-100 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 max-w-[90%]">
      <AgentBadge agentType={agentType} />
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-zinc-800/60 border border-zinc-700/40 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
        {message.content || <span className="text-zinc-500 italic">Thinking...</span>}
      </div>
    </div>
  );
}
