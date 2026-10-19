import { supabase } from '@/lib/supabase';

export async function createStudySet(title: string, description?: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

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

export async function deleteStudySet(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('study_sets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
