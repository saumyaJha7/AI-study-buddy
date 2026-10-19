-- Enum types used as discriminators across the schema.
-- Wrapped so the migration can be re-run safely from the SQL editor.
do $$
begin
  create type public.source_type as enum ('pdf', 'note', 'web');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.processing_status as enum ('pending', 'processing', 'ready', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.message_role as enum ('user', 'assistant', 'system');
exception
  when duplicate_object then null;
end $$;
