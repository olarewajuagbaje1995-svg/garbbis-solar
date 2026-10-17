-- 001_schema.sql : tables, helper functions and triggers.
-- Safe to run more than once. Run this FIRST.

-- ---------- Administrator roles ----------
create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- Returns true only if the signed-in user has an admin row.
-- SECURITY DEFINER lets policies check user_roles without exposing it to everyone.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Keeps updated_at current on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Categories ----------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  name       text not null check (char_length(name) between 2 and 80),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Products ----------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  name           text not null check (char_length(name) between 2 and 150),
  description    text not null default '' check (char_length(description) <= 5000),
  category_id    uuid not null references public.categories (id) on delete restrict,
  price_ngn      numeric(14, 2) check (price_ngn is null or price_ngn >= 0),
  availability   text not null default 'contact' check (availability in ('in_stock', 'out_of_stock', 'contact')),
  specifications jsonb not null default '[]'::jsonb check (jsonb_typeof(specifications) = 'array'),
  image_paths    text[] not null default '{}',
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_published_idx on public.products (is_published, created_at desc);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------- Services ----------
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title        text not null check (char_length(title) between 2 and 150),
  summary      text not null default '' check (char_length(summary) <= 300),
  description  text not null default '' check (char_length(description) <= 5000),
  image_path   text,
  sort_order   integer not null default 0,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists services_published_idx on public.services (is_published, sort_order);

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- ---------- Enquiries ----------
create table if not exists public.enquiries (
  id            uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone         text not null check (phone ~ '^\+?[0-9][0-9 ()-]{6,18}$'),
  location      text not null check (char_length(location) between 2 and 150),
  enquiry_type  text not null check (enquiry_type in
                  ('product_enquiry', 'service_enquiry', 'installation_quote', 'repair_maintenance', 'general')),
  product_id    uuid references public.products (id) on delete set null,
  service_id    uuid references public.services (id) on delete set null,
  item_label    text check (item_label is null or char_length(item_label) <= 150),
  requirements  text check (requirements is null or char_length(requirements) <= 1000),
  message       text check (message is null or char_length(message) <= 2000),
  status        text not null default 'new' check (status in ('new', 'contacted', 'resolved')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists enquiries_status_created_idx on public.enquiries (status, created_at desc);
create index if not exists enquiries_phone_created_idx on public.enquiries (phone, created_at desc);

drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at before update on public.enquiries
  for each row execute function public.set_updated_at();

-- Simple abuse control: at most 5 enquiries per phone number per hour.
-- SECURITY DEFINER because visitors are not allowed to read the enquiries table.
create or replace function public.enforce_enquiry_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.enquiries
    where phone = new.phone and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'rate_limit: too many enquiries for this phone number' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists enquiries_rate_limit on public.enquiries;
create trigger enquiries_rate_limit before insert on public.enquiries
  for each row execute function public.enforce_enquiry_rate_limit();