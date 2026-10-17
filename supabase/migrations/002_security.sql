-- 002_security.sql : grants, Row Level Security policies and image storage.
-- Safe to run more than once. Run this SECOND (after 001_schema.sql).

-- ---------- Turn RLS on everywhere ----------
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.services   enable row level security;
alter table public.enquiries  enable row level security;

-- ---------- Grants (what each database role may even attempt) ----------
-- RLS then decides which rows. Both layers must allow an action.
revoke all on public.user_roles, public.categories, public.products, public.services, public.enquiries
  from anon, authenticated;

grant select on public.categories, public.products, public.services to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.services to authenticated;

-- A signed-in user may read only their own role row (the policy below enforces "own").
grant select on public.user_roles to authenticated;
-- No insert/update/delete on user_roles for anyone using the website keys.

-- Visitors may insert only these columns. They cannot set status or timestamps.
grant insert (id, customer_name, phone, location, enquiry_type, product_id, service_id, item_label, requirements, message)
  on public.enquiries to anon, authenticated;
-- Only authenticated users can read, change status, or delete (and RLS limits that to admins).
grant select, delete on public.enquiries to authenticated;
grant update (status) on public.enquiries to authenticated;

-- ---------- user_roles ----------
drop policy if exists "read own role" on public.user_roles;
create policy "read own role" on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------- categories ----------
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories" on public.categories
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------- products ----------
drop policy if exists "public read published products" on public.products;
create policy "public read published products" on public.products
  for select to anon, authenticated using (is_published = true);

drop policy if exists "admin manage products" on public.products;
create policy "admin manage products" on public.products
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------- services ----------
drop policy if exists "public read published services" on public.services;
create policy "public read published services" on public.services
  for select to anon, authenticated using (is_published = true);

drop policy if exists "admin manage services" on public.services;
create policy "admin manage services" on public.services
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------- enquiries ----------
drop policy if exists "anyone can submit enquiry" on public.enquiries;
create policy "anyone can submit enquiry" on public.enquiries
  for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists "admin read enquiries" on public.enquiries;
create policy "admin read enquiries" on public.enquiries
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "admin update enquiries" on public.enquiries;
create policy "admin update enquiries" on public.enquiries
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admin delete enquiries" on public.enquiries;
create policy "admin delete enquiries" on public.enquiries
  for delete to authenticated using ((select public.is_admin()));

-- ---------- Storage bucket for images ----------
-- Public bucket: anyone with an image's URL can view it (needed for the public website).
-- Never upload private documents here.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin read site images" on storage.objects;
create policy "admin read site images" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()));

drop policy if exists "admin upload site images" on storage.objects;
create policy "admin upload site images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-images' and (select public.is_admin()));

drop policy if exists "admin update site images" on storage.objects;
create policy "admin update site images" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()))
  with check (bucket_id = 'site-images' and (select public.is_admin()));

drop policy if exists "admin delete site images" on storage.objects;
create policy "admin delete site images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()));