-- Study set: the organizing container a user creates.
create table if not exists public.study_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists study_sets_set_updated_at on public.study_sets;
create trigger study_sets_set_updated_at
  before update on public.study_sets
  for each row execute function public.set_updated_at();

-- Sources: polymorphic (pdf | note | web) attached to a study set.
-- The app currently exposes PDF and web sources; note stays in the enum for later.
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  type public.source_type not null,
  title text not null,
  status public.processing_status not null default 'pending',
  error_message text,
  storage_path text,
  file_size bigint,
  mime_type text,
  content text,
  url text,
  fetched_content text,
  fetched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sources_type_fields_check check (
    (type = 'pdf' and storage_path is not null)
    or (type = 'note' and content is not null)
    or (type = 'web' and url is not null)
  )
);

drop trigger if exists sources_set_updated_at on public.sources;
create trigger sources_set_updated_at
  before update on public.sources
  for each row execute function public.set_updated_at();
