import { chunkText } from '@/lib/rag/chunker';
import type { RagDocument } from '@/lib/types/rag';

export async function POST(request: Request) {
  const { text, title } = await request.json() as { text: string; title: string };

  if (!text || !title) {
    return Response.json({ error: 'text and title required' }, { status: 400 });
  }

  const chunks = chunkText(text.trim());
  const docId = crypto.randomUUID();

  const ragDoc: RagDocument = {
    id: docId,
    title,
    content: text,
    uploadedAt: Date.now(),
    chunks: chunks.map((t, i) => ({
      id: crypto.randomUUID(),
      text: t,
      documentId: docId,
      index: i,
    })),
  };

  return Response.json(ragDoc);
}
