-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  coins integer default 500 not null,
  total_wins integer default 0 not null,
  total_games integer default 0 not null,
  win_streak integer default 0 not null,
  best_streak integer default 0 not null,
  xp integer default 0 not null,
  level integer default 1 not null,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
