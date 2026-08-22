-- NEXUS — add updated_at to habits/goals
-- Run this in the Supabase SQL editor (or via `supabase db push`) after
-- 0005_fix_projects_rls_recursion.sql.
--
-- Spec §41 (Database) asks for `created_at`/`updated_at` "where appropriate".
-- Every other mutable table in this schema (tasks, notes, projects,
-- calendar_events, ai_conversations) already carries both plus a
-- set_updated_at trigger. habits and goals were added later in
-- 0004_phase14_habits_goals.sql with only created_at, even though both are
-- genuinely mutated after creation — toggleHabitCompletion() updates
-- habits.completions and updateGoal() updates goals fields directly
-- (see src/lib/store/useLifeStore.ts). This closes that gap using the same
-- public.set_updated_at() helper the other tables already share.

alter table public.habits
  add column updated_at timestamptz not null default now();

alter table public.goals
  add column updated_at timestamptz not null default now();

create trigger set_habits_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

create trigger set_goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();
