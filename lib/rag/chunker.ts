export function chunkText(text: string, chunkSize = 300, overlap = 40): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.length > 50) chunks.push(chunk);
    i += chunkSize - overlap;
  }

  return chunks;
}
