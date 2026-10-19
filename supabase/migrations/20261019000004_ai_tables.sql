-- Chunked source text used for keyword retrieval and AI generation.
create table if not exists public.source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources (id) on delete cascade,
  chunk_index int not null,
  content text not null,
  token_count int,
  created_at timestamptz not null default now()
);

-- AI-generated summaries (multiple allowed; the UI shows the latest).
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  content text not null,
  model text,
  prompt_version text,
  created_at timestamptz not null default now()
);

-- Flashcard decks + cards.
create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks (id) on delete cascade,
  front text not null,
  back text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Chat conversations scoped to a study set + their messages.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role public.message_role not null,
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
