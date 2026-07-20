-- ============================================================
-- REFAR веб-сайт — Supabase схемаси (ADDITIVE, web_ префикс)
-- CRM жадвалларига тегмайди. Supabase SQL Editor'да ишга туширинг.
-- ============================================================

-- 1) ФОЙДАЛАНУВЧИ ПРОФИЛЛАРИ (auth.users билан боғланган)
create table if not exists public.web_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'user',      -- 'user' | 'agent' | 'admin'
  lang text not null default 'uz',         -- 'uz' | 'ru' | 'en'
  created_at timestamptz not null default now()
);

-- 2) ЭЪЛОНЛАР
create table if not exists public.web_listings (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  ref_code text unique default ('RFR-' || floor(random()*90000+10000)::text),
  title text not null,
  deal_type text not null default 'sale',  -- 'sale' | 'rent' | 'daily'
  prop_type text not null default 'apartment', -- apartment/house/commercial/land/new
  region text,                              -- Тошкент, Фарғона...
  district text,                            -- туман
  address text,
  price numeric not null default 0,
  currency text not null default 'USD',     -- USD | UZS
  rooms int,
  area numeric,
  floor int,
  floor_total int,
  year_built int,
  description text,
  images jsonb not null default '[]'::jsonb, -- ["url1","url2"]
  status text not null default 'pending',   -- 'pending' | 'approved' | 'rejected' | 'sold'
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists web_listings_status_idx on public.web_listings(status);
create index if not exists web_listings_user_idx on public.web_listings(user_id);
create index if not exists web_listings_deal_idx on public.web_listings(deal_type);

-- 3) ЯНГИ ФОЙДАЛАНУВЧИ РЎЙХАТДАН ЎТГАНДА ПРОФИЛ ЯРАТИШ (триггер)
create or replace function public.web_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.web_profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists web_on_auth_user_created on auth.users;
create trigger web_on_auth_user_created
  after insert on auth.users
  for each row execute function public.web_handle_new_user();

-- 4) АДМИН ТЕКШИРУВ ФУНКЦИЯСИ
create or replace function public.web_is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.web_profiles where id = auth.uid() and role = 'admin');
$$;

-- 5) RLS (Row Level Security) — хавфсизлик
alter table public.web_profiles enable row level security;
alter table public.web_listings enable row level security;

-- Профиллар: ўзиникини кўради/таҳрирлайди, админ ҳаммасини
drop policy if exists web_prof_self_read on public.web_profiles;
create policy web_prof_self_read on public.web_profiles for select
  using (id = auth.uid() or public.web_is_admin());
drop policy if exists web_prof_self_upd on public.web_profiles;
create policy web_prof_self_upd on public.web_profiles for update
  using (id = auth.uid() or public.web_is_admin());
drop policy if exists web_prof_admin_all on public.web_profiles;
create policy web_prof_admin_all on public.web_profiles for all
  using (public.web_is_admin()) with check (public.web_is_admin());

-- Эълонлар: ҳамма тасдиқланганини кўради; эга ўзиникини бошқаради; админ ҳаммасини
drop policy if exists web_list_public_read on public.web_listings;
create policy web_list_public_read on public.web_listings for select
  using (status = 'approved' or user_id = auth.uid() or public.web_is_admin());
drop policy if exists web_list_owner_insert on public.web_listings;
create policy web_list_owner_insert on public.web_listings for insert
  with check (user_id = auth.uid());
drop policy if exists web_list_owner_update on public.web_listings;
create policy web_list_owner_update on public.web_listings for update
  using (user_id = auth.uid() or public.web_is_admin());
drop policy if exists web_list_owner_delete on public.web_listings;
create policy web_list_owner_delete on public.web_listings for delete
  using (user_id = auth.uid() or public.web_is_admin());

-- 6) STORAGE (расм юклаш учун) — 'listings' bucket
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

drop policy if exists web_storage_read on storage.objects;
create policy web_storage_read on storage.objects for select
  using (bucket_id = 'listings');
drop policy if exists web_storage_insert on storage.objects;
create policy web_storage_insert on storage.objects for insert
  with check (bucket_id = 'listings' and auth.role() = 'authenticated');
drop policy if exists web_storage_delete on storage.objects;
create policy web_storage_delete on storage.objects for delete
  using (bucket_id = 'listings' and owner = auth.uid());

-- ============================================================
-- ⚠️  ЎЗИНГИЗНИ АДМИН ҚИЛИШ:
-- Рўйхатдан ўтгач, email'ингизни ёзиб қуйидагини ишга туширинг:
--   update public.web_profiles set role='admin'
--   where id = (select id from auth.users where email='SIZNING@email.uz');
-- ============================================================
