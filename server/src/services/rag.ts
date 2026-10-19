import { supabaseAdmin } from '../lib/supabase.js';

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
