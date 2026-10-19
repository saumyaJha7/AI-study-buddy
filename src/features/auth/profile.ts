import { supabase } from '@/lib/supabase';

export async function ensureProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split('@')[0] ??
    null;

  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, display_name: displayName },
      { onConflict: 'id', ignoreDuplicates: true }
    );

  if (error) throw error;

  return user;
}
