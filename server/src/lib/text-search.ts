const STOP_WORDS = new Set(
  'a an and are as at be by can could did do does explain for from give how i in is it me my of on or please should summarize summary tell that the their these this to was were what when where which who why will with would you your'.split(
    ' '
  )
);

export function searchTerms(query: string): string[] {
  return [
    ...new Set(
      (query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(
        (word) => word.length > 1 && !STOP_WORDS.has(word)
      )
    ),
  ].slice(0, 12);
}

export function rankPassages<T extends { id: string; content: string }>(
  chunks: T[],
  terms: string[],
  count: number
) {
  return chunks
    .map((chunk) => {
      const words = new Set(
        chunk.content.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
      );
      const hits = terms.filter((term) => words.has(term)).length;

      return {
        id: chunk.id,
        content: chunk.content,
        similarity: terms.length ? hits / terms.length : 0,
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, Math.max(0, count));
}
