-- Run this entire script in Supabase > SQL Editor > New query.
-- The browser app uses only the anon/public key. Row Level Security protects profiles.
create table if not exists public.player_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Shadow Rookie' check (char_length(display_name) between 1 and 18),
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  wins integer not null default 0 check (wins >= 0),
  best_wpm integer not null default 0 check (best_wpm >= 0),
  updated_at timestamptz not null default now()
);

alter table public.player_profiles enable row level security;

drop policy if exists "Profiles are publicly readable" on public.player_profiles;
create policy "Profiles are publicly readable"
on public.player_profiles for select
to anon, authenticated
using (true);

drop policy if exists "Players can insert their own profile" on public.player_profiles;
create policy "Players can insert their own profile"
on public.player_profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Players can update their own profile" on public.player_profiles;
create policy "Players can update their own profile"
on public.player_profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Optional: create a profile automatically when a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.player_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Shadow Rookie'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- NOTE: This starter stores scores sent by the browser. For a competitive public
-- leaderboard, move score validation to a trusted server/Edge Function so users
-- cannot modify their own scores with browser developer tools.