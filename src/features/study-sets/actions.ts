import { STUDY_MATERIALS_BUCKET } from '@/constants/storage';
import { ensureProfile } from '@/features/auth/profile';
import { supabase } from '@/lib/supabase';

import type { Conversation } from './query';

export async function createStudySet(title: string, description?: string) {
  const user = await ensureProfile();

  const { data, error } = await supabase
    .from('study_sets')
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function createConversation(
  studySetId: string,
  title?: string
): Promise<Conversation> {
  const user = await ensureProfile();

  const { data: studySet, error: studySetError } = await supabase
    .from('study_sets')
    .select('id')
    .eq('id', studySetId)
    .single();

  if (studySetError) throw studySetError;
  if (!studySet) throw new Error('Study set not found');

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      study_set_id: studySetId,
      title: title?.trim() || 'Study chat',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function deleteStudySet(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: sources, error: sourcesError } = await supabase
    .from('sources')
    .select('storage_path')
    .eq('study_set_id', id)
    .eq('user_id', user.id);

  if (sourcesError) throw sourcesError;

  const prefix = `${user.id}/${id}/`;
  const paths = (sources ?? [])
    .map((source) => source.storage_path)
    .filter(
      (path): path is string =>
        typeof path === 'string' && path.startsWith(prefix)
    );

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(STUDY_MATERIALS_BUCKET)
      .remove(paths);

    if (storageError) throw storageError;
  }

  const { error } = await supabase
    .from('study_sets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
