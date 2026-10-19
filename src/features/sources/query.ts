import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type SourceStatus = 'pending' | 'processing' | 'ready' | 'failed';
export type SourceType = 'pdf' | 'note' | 'web';

export type Source = {
  id: string;
  user_id: string;
  study_set_id: string;
  type: SourceType;
  title: string;
  status: SourceStatus;
  error_message: string | null;
  storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
};

export const sourceKeys = {
  all: ['sources'] as const,
  list: (studySetId: string) => [...sourceKeys.all, studySetId] as const,
};

export function useSources(studySetId: string | undefined) {
  return useQuery({
    queryKey: sourceKeys.list(studySetId ?? ''),
    enabled: Boolean(studySetId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('study_set_id', studySetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Source[];
    },
  });
}
