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

export type Summary = {
  id: string;
  user_id: string;
  study_set_id: string;
  content: string;
  model: string | null;
  prompt_version: string | null;
  created_at: string;
};

export type FlashcardDeck = {
  id: string;
  user_id: string;
  study_set_id: string;
  title: string;
  created_at: string;
};

export type Flashcard = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  sort_order: number;
  created_at: string;
};

export type FlashcardDeckWithCards = {
  deck: FlashcardDeck;
  cards: Flashcard[];
};

export const studySetKeys = {
  all: ['study-sets'] as const,
  detail: (id: string) => ['study-sets', id] as const,
  summary: (id: string) => ['study-sets', id, 'summary'] as const,
  flashcards: (id: string) => ['study-sets', id, 'flashcards'] as const,
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

export function useLatestSummary(studySetId: string) {
  return useQuery({
    queryKey: studySetKeys.summary(studySetId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .eq('study_set_id', studySetId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Summary | null;
    },
    enabled: !!studySetId,
  });
}

export function useLatestFlashcardDeck(studySetId: string) {
  return useQuery({
    queryKey: studySetKeys.flashcards(studySetId),
    queryFn: async () => {
      const { data: deck, error: deckError } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('study_set_id', studySetId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (deckError) throw deckError;
      if (!deck) return null;

      const { data: cards, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deck.id)
        .order('sort_order', { ascending: true });

      if (cardsError) throw cardsError;

      return {
        deck: deck as FlashcardDeck,
        cards: (cards ?? []) as Flashcard[],
      } satisfies FlashcardDeckWithCards;
    },
    enabled: !!studySetId,
  });
}
