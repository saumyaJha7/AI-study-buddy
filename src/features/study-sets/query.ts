import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type StudySet = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export const studySetKeys = {
  all: ['study-sets'] as const,
  detail: (id: string) => ['study-sets', id] as const,
};

export function useStudySets() {
  return useQuery({
    queryKey: studySetKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sets')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as StudySet[];
    },
  });
}

export function useStudySet(id: string) {
  return useQuery({
    queryKey: studySetKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sets')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as StudySet;
    },
    enabled: !!id,
  });
}
