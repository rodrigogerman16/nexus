-- NEXUS — Phase 14: real backend wiring for Habits, Goals, Activity &
-- Notifications. Run this in the Supabase SQL editor (or via
-- `supabase db push`) after 0003_phase13_notes_tags.sql.
--
-- notifications and activities already exist (0001_init.sql) and need no
-- schema changes. habits/goals were never created — the original schema
-- only covered projects/tasks/notes/calendar/notifications/activities/AI.

-- ─────────────────────────────────────────────────────────────────────────
-- habits — completions stored as a date-key -> boolean map, matching the
-- app's in-memory shape directly rather than a normalized child table.
-- ─────────────────────────────────────────────────────────────────────────
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  target_per_week smallint not null default 5,
  completions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index habits_owner_id_idx on public.habits(owner_id);

-- ─────────────────────────────────────────────────────────────────────────
-- goals
-- ─────────────────────────────────────────────────────────────────────────
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  progress smallint not null default 0 check (progress between 0 and 100),
  target_date timestamptz,
  linked_habit_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now()
);

create index goals_owner_id_idx on public.goals(owner_id);

alter table public.habits enable row level security;
alter table public.goals enable row level security;

create policy "Owners manage their habits"
  on public.habits for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners manage their goals"
  on public.goals for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
