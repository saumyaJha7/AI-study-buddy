import { supabaseAdmin } from '../lib/supabase.js';
import { chunkText } from './chunk.js';
import { extractPdfText } from './pdf.js';

type SourceRow = {
  id: string;
  type: 'pdf' | 'note' | 'web';
  content: string | null;
  storage_path: string | null;
};

async function resolveSourceText(source: SourceRow): Promise<string> {
  if (source.type !== 'pdf') {
    throw new Error('Only PDF sources are supported.');
  }

  if (!source.storage_path) {
    throw new Error('Storage path is required for PDF sources.');
  }

  return extractPdfText(source.storage_path);
}

async function markFailed(sourceId: string, message: string) {
  await supabaseAdmin
    .from('sources')
    .update({ status: 'failed', error_message: message })
    .eq('id', sourceId);
}

export async function ingestSource(
  sourceId: string,
  userId: string
): Promise<{ chunkCount: number }> {
  const { data: source, error } = await supabaseAdmin
    .from('sources')
    .select('id, type, content, storage_path')
    .eq('id', sourceId)
    .eq('user_id', userId)
    .single();

  if (error || !source) {
    throw Object.assign(new Error('Source not found'), { status: 404 });
  }

  await supabaseAdmin
    .from('sources')
    .update({ status: 'processing', error_message: null })
    .eq('id', sourceId);

  try {
    const text = await resolveSourceText(source as SourceRow);
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      const message = 'No extractable text found in source';
      await markFailed(sourceId, message);
      throw Object.assign(new Error(message), { status: 422 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('source_chunks')
      .delete()
      .eq('source_id', sourceId);

    if (deleteError) throw new Error(deleteError.message);

    const rows = chunks.map((content, index) => ({
      source_id: sourceId,
      chunk_index: index,
      content,
      token_count: Math.ceil(content.length / 4),
    }));

    const { error: insertError } = await supabaseAdmin
      .from('source_chunks')
      .insert(rows);

    if (insertError) throw new Error(insertError.message);

    const { error: readyError } = await supabaseAdmin
      .from('sources')
      .update({ status: 'ready', error_message: null })
      .eq('id', sourceId);

    if (readyError) throw new Error(readyError.message);

    return { chunkCount: chunks.length };
  } catch (err) {
    await markFailed(
      sourceId,
      err instanceof Error ? err.message : 'Processing failed'
    );
    throw err;
  }
}
