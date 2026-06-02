'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils';
import type { AgentType } from '@/lib/agents/prompts';

const STARTER_QUESTIONS: Record<AgentType, string[]> = {
  financial: [
    'Analyze AAPL\'s financial health',
    'Compare TSLA vs BYD financials',
    'Is NVDA overvalued based on fundamentals?',
    'Analyze MSFT\'s balance sheet strength',
  ],
  sentiment: [
    'What\'s the market sentiment on TSLA?',
    'Any negative news around META recently?',
    'How is the market reacting to NVDA earnings?',
    'Summarize recent news for AMZN',
  ],
  forecasting: [
    'Forecast NVDA stock for next quarter',
    'What\'s a fair value range for AAPL?',
    'Project MSFT revenue for next year',
    'When might TSLA become profitable?',
  ],
  strategy: [
    'Build me a diversified tech portfolio strategy',
    'Should I buy AAPL at current prices?',
    'What\'s a good entry point for GOOGL?',
    'Compare risk/reward of NVDA vs AMD',
  ],
};

interface AgentChatProps {
  agentType: AgentType;
}

export function AgentChat({ agentType }: AgentChatProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, status, sendMessage, clearMessages } = useStreamingChat({
    api: '/api/agents/chat',
    extraBody: { agentType },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const starters = STARTER_QUESTIONS[agentType] ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  }

  function handleStarter(q: string) {
    sendMessage(q);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
            <p className="text-zinc-500 text-sm text-center">
              Ask a financial question or choose a starter below
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              {starters.map((q) => (
                <button
                  key={q}
                  onClick={() => handleStarter(q)}
                  className="px-4 py-2.5 text-left text-sm text-zinc-300 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 hover:border-zinc-600/60 rounded-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} agentType={agentType} />
            ))}
            {status === 'streaming' && messages[messages.length - 1]?.role !== 'assistant' && (
              <TypingIndicator />
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800/60 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about any company or market..."
            disabled={status === 'streaming'}
            className="flex-1 px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'streaming' || !input.trim()}
            className={cn(
              'px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              'hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              className="px-3 py-2.5 rounded-lg border border-zinc-700/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600/60 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
