'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, BookOpen } from 'lucide-react';
import { useRagStore } from '@/lib/stores/ragStore';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { GlassCard } from '@/components/ui/GlassCard';
import { TypingIndicator } from '@/components/insights/TypingIndicator';
import { cn } from '@/lib/utils';
import type { RagChunk } from '@/lib/types/rag';

const STARTER_QUESTIONS = [
  'What are the key revenue growth drivers?',
  'What risks does management highlight?',
  'Summarize the financial highlights',
  'What guidance was provided for next quarter?',
];

export function RagChat() {
  const [input, setInput] = useState('');
  const { documents } = useRagStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const allChunks: RagChunk[] = documents.flatMap((d) => d.chunks);

  const { messages, status, sendMessage, clearMessages } = useStreamingChat({
    api: '/api/rag/chat',
    extraBody: { chunks: allChunks },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-zinc-300">Document Q&A</span>
        </div>
        {documents.length > 0 && (
          <span className="text-xs text-zinc-500">{allChunks.length} chunks indexed</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
            {documents.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center">
                Upload a document on the left to start asking questions
              </p>
            ) : (
              <>
                <p className="text-zinc-500 text-sm text-center">
                  Ask questions about your uploaded documents
                </p>
                <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-4 py-2.5 text-left text-sm text-zinc-300 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 hover:border-zinc-600/60 rounded-lg transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : ''}`}>
              <div className={cn(
                'max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed',
                msg.role === 'user'
                  ? 'rounded-tr-sm bg-emerald-500/10 border border-emerald-500/20 text-zinc-100'
                  : 'rounded-tl-sm bg-zinc-800/60 border border-zinc-700/40 text-zinc-200'
              )}>
                {msg.content || <span className="text-zinc-500 italic">Thinking...</span>}
              </div>
            </div>
          ))
        )}
        {status === 'streaming' && messages.at(-1)?.role !== 'assistant' && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-800/60 p-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={documents.length === 0 ? 'Upload a document first...' : 'Ask about the documents...'}
            disabled={status === 'streaming' || documents.length === 0}
            className="flex-1 px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'streaming' || !input.trim() || documents.length === 0}
            className="px-3 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
