import { findRelevantChunks } from '@/lib/rag/retriever';
import { streamGeminiText, type ChatTurn } from '@/lib/api/gemini';
import type { RagChunk } from '@/lib/types/rag';

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages?: ChatTurn[];
    chunks?: RagChunk[];
  };

  const messages: ChatTurn[] = body.messages ?? [];
  const chunks: RagChunk[] = body.chunks ?? [];

  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const query = typeof lastUserMsg?.content === 'string' ? lastUserMsg.content : '';

  const relevant = findRelevantChunks(query, chunks, 6);
  const context = relevant.map((c) => c.text).join('\n\n---\n\n');

  const system = `You are a financial document analyst. Answer questions based ONLY on the provided document excerpts.
If the information is not in the provided context, clearly say "This information is not available in the uploaded documents."
Be precise, cite specific numbers and data points from the documents when available.

Document excerpts:
${context || 'No relevant excerpts found. Please upload documents first.'}`;

  // No grounding here — answers must stay grounded in the uploaded documents only.
  return streamGeminiText({ system, messages, search: false });
}
