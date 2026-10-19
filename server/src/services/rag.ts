import { supabaseAdmin } from '../lib/supabase.js';
import { rankPassages, searchTerms } from '../lib/text-search.js';

export type MatchedChunk = {
  id: string;
  content: string;
  similarity: number;
};

async function readySourceIds(studySetId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('sources')
    .select('id')
    .eq('study_set_id', studySetId)
    .eq('status', 'ready');

  if (error) {
    throw new Error(`Failed to load sources: ${error.message}`);
  }

  return (data ?? []).map((source) => source.id);
}

export async function retrieveContext(
  studySetId: string,
  query: string,
  matchCount = 8
): Promise<MatchedChunk[]> {
  const sourceIds = await readySourceIds(studySetId);
  if (!sourceIds.length) return [];

  const terms = searchTerms(query);
  let request = supabaseAdmin
    .from('source_chunks')
    .select('id, content')
    .in('source_id', sourceIds)
    .order('source_id')
    .order('chunk_index')
    .limit(128);

  if (terms.length) {
    request = request.or(
      terms.map((term) => `content.ilike.%${term}%`).join(',')
    );
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(`Text search failed: ${error.message}`);
  }

  if (data?.length) {
    return rankPassages(data, terms, matchCount);
  }

  const fallback = await supabaseAdmin
    .from('source_chunks')
    .select('id, content')
    .in('source_id', sourceIds)
    .order('chunk_index')
    .order('id')
    .limit(matchCount);

  if (fallback.error) {
    throw new Error(`Failed to load context: ${fallback.error.message}`);
  }

  return rankPassages(fallback.data ?? [], [], matchCount);
}

export async function getStudySetText(
  studySetId: string,
  maxChars = 24000
): Promise<string> {
  const sourceIds = await readySourceIds(studySetId);
  if (!sourceIds.length) return '';

  const { data, error } = await supabaseAdmin
    .from('source_chunks')
    .select('content, chunk_index')
    .in('source_id', sourceIds)
    .order('source_id')
    .order('chunk_index')
    .order('id');

  if (error) {
    throw new Error(`Failed to load study material: ${error.message}`);
  }

  let text = '';

  for (const chunk of data ?? []) {
    if (text.length + chunk.content.length + 2 > maxChars) break;
    text += `${chunk.content}\n\n`;
  }

  return text.trim();
}
