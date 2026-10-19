import { createClient } from '@supabase/supabase-js';

import { env } from '../env.js';

const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
} as const;

export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  clientOptions
);

const supabaseAuth = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey,
  clientOptions
);

export async function getUserIdFromToken(
  token: string
): Promise<string | null> {
  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user.id;
}
