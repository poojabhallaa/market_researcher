'use client';
import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export type ChatStatus = 'ready' | 'streaming' | 'error';

interface UseStreamingChatOptions {
  api: string;
  extraBody?: Record<string, unknown>;
}

export function useStreamingChat({ api, extraBody = {} }: UseStreamingChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('ready');

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || status === 'streaming') return;

      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '' },
      ]);
      setStatus('streaming');

      try {
        const history = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, ...extraBody }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const current = accumulated;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: current } : m))
          );
        }

        setStatus('ready');
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` }
              : m
          )
        );
        setStatus('error');
        setTimeout(() => setStatus('ready'), 2000);
      }
    },
    [api, extraBody, messages, status]
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, status, sendMessage, clearMessages };
}
