-- Private bucket for uploaded study materials (PDFs).
insert into storage.buckets (id, name, public)
values ('study-materials', 'study-materials', false)
on conflict (id) do nothing;

-- Ownership is enforced via the first path segment = auth.uid().
-- Path convention: {user_id}/{study_set_id}/{source_id}.pdf
drop policy if exists "Users can upload own study materials" on storage.objects;
create policy "Users can upload own study materials"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'study-materials'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can view own study materials" on storage.objects;
create policy "Users can view own study materials"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'study-materials'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update own study materials" on storage.objects;
create policy "Users can update own study materials"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'study-materials'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'study-materials'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete own study materials" on storage.objects;
create policy "Users can delete own study materials"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'study-materials'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
