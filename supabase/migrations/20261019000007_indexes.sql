-- Indexes for list views, processing polls, and foreign keys.
create index if not exists profiles_created_idx
  on public.profiles (created_at desc);

create index if not exists study_sets_user_created_idx
  on public.study_sets (user_id, created_at desc);

create index if not exists sources_study_set_created_idx
  on public.sources (study_set_id, created_at desc);

create index if not exists sources_processing_idx
  on public.sources (user_id, status)
  where status <> 'ready';

create index if not exists source_chunks_source_idx
  on public.source_chunks (source_id, chunk_index);

create index if not exists summaries_study_set_created_idx
  on public.summaries (study_set_id, created_at desc);

create index if not exists summaries_user_idx
  on public.summaries (user_id);

create index if not exists flashcard_decks_study_set_idx
  on public.flashcard_decks (study_set_id, created_at desc);

create index if not exists flashcard_decks_user_idx
  on public.flashcard_decks (user_id);

create index if not exists flashcards_deck_sort_idx
  on public.flashcards (deck_id, sort_order);

create index if not exists conversations_user_set_updated_idx
  on public.conversations (user_id, study_set_id, updated_at desc);

create index if not exists conversations_study_set_idx
  on public.conversations (study_set_id);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at asc);
