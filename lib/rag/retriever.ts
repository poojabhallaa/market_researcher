import type { RagChunk } from '@/lib/types/rag';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function tfidfScore(query: string, chunk: string): number {
  const queryTokens = new Set(tokenize(query));
  const chunkTokens = tokenize(chunk);
  const chunkSet = new Set(chunkTokens);

  let matchCount = 0;
  for (const token of queryTokens) {
    if (chunkSet.has(token)) matchCount++;
  }

  // TF: occurrences of query terms in chunk
  let tf = 0;
  for (const token of chunkTokens) {
    if (queryTokens.has(token)) tf++;
  }

  const termFrequency = chunkTokens.length > 0 ? tf / chunkTokens.length : 0;
  const coverage = queryTokens.size > 0 ? matchCount / queryTokens.size : 0;

  return termFrequency * 0.4 + coverage * 0.6;
}

export function findRelevantChunks(query: string, chunks: RagChunk[], topK = 5): RagChunk[] {
  if (!chunks.length || !query.trim()) return [];

  return chunks
    .map((chunk) => ({ chunk, score: tfidfScore(query, chunk.text) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r) => r.chunk);
}
