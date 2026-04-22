-- ═══════════════════════════════════════════
-- GameHub Supabase Schema
-- Führe dies im Supabase SQL-Editor aus
-- ═══════════════════════════════════════════

-- Profiles (wird bei Registrierung auto-erstellt)
create table if not exists profiles (
  id         uuid references auth.users on delete cascade primary key,
  username   text unique not null,
  created_at timestamptz default now()
);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Game Saves (ein Save pro User pro Spiel)
create table if not exists game_saves (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references profiles(id) on delete cascade not null,
  game_id    text not null,
  save_data  jsonb not null default '{}',
  updated_at timestamptz default now(),
  unique(user_id, game_id)
);

-- Leaderboard
create table if not exists leaderboard (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  game_id     text not null,
  score       numeric not null default 0,
  score_label text,
  updated_at  timestamptz default now(),
  unique(user_id, game_id)
);

-- Achievements
create table if not exists user_achievements (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references profiles(id) on delete cascade not null,
  game_id        text not null,
  achievement_id text not null,
  unlocked_at    timestamptz default now(),
  unique(user_id, game_id, achievement_id)
);

-- ═══ RLS POLICIES ═══════════════════════════════════

alter table profiles enable row level security;
alter table game_saves enable row level security;
alter table leaderboard enable row level security;
alter table user_achievements enable row level security;

-- Profiles: jeder kann lesen, nur selbst schreiben
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Saves: nur eigene
create policy "saves_select" on game_saves for select using (auth.uid() = user_id);
create policy "saves_upsert" on game_saves for insert with check (auth.uid() = user_id);
create policy "saves_update" on game_saves for update using (auth.uid() = user_id);

-- Leaderboard: jeder lesen, nur eigene schreiben
create policy "lb_select" on leaderboard for select using (true);
create policy "lb_insert" on leaderboard for insert with check (auth.uid() = user_id);
create policy "lb_update" on leaderboard for update using (auth.uid() = user_id);

-- Achievements: nur eigene
create policy "ach_select" on user_achievements for select using (auth.uid() = user_id);
create policy "ach_insert" on user_achievements for insert with check (auth.uid() = user_id);

-- ═══ INDEXES ═════════════════════════════════════════
create index if not exists idx_leaderboard_game_score on leaderboard(game_id, score desc);
create index if not exists idx_saves_user_game on game_saves(user_id, game_id);
create index if not exists idx_achievements_user on user_achievements(user_id, game_id);

-- ═══ REALTIME (optional) ════════════════════════════
alter publication supabase_realtime add table leaderboard;
