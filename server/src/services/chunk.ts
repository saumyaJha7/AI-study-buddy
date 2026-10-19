const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

export function chunkText(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length);
    chunks.push(normalized.slice(start, end));

    if (end === normalized.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}
