-- NEXUS — fix infinite recursion in the projects/project_members RLS
-- policies. Run this in the Supabase SQL editor (or via `supabase db push`)
-- after 0004_phase14_habits_goals.sql.
--
-- 0001_init.sql's "Members can view their projects" policy on `projects`
-- subqueries `project_members`, and "Project owners manage membership" on
-- `project_members` subqueries `projects` right back. Postgres has to
-- re-evaluate RLS on each table to run the other's subquery, which loops
-- forever — every `select ... from projects` fails with
-- 42P17 "infinite recursion detected in policy for relation \"projects\"".
--
-- Fix: move each cross-table check into a `security definer` function. A
-- security definer function runs with the privileges of its owner (the
-- migration role, which has BYPASSRLS on Supabase), so the query inside it
-- skips RLS entirely instead of triggering the other table's policies —
-- breaking the cycle while keeping the same access rules.

create or replace function public.is_project_member(p_project_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.project_members pm
    where pm.project_id = p_project_id and pm.user_id = p_user_id
  );
$$;

create or replace function public.is_project_owner(p_project_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id and p.owner_id = p_user_id
  );
$$;

grant execute on function public.is_project_member(uuid, uuid) to authenticated;
grant execute on function public.is_project_owner(uuid, uuid) to authenticated;

drop policy if exists "Members can view their projects" on public.projects;
create policy "Members can view their projects"
  on public.projects for select
  using (public.is_project_member(id, auth.uid()));

drop policy if exists "Project owners manage membership" on public.project_members;
create policy "Project owners manage membership"
  on public.project_members for all
  using (public.is_project_owner(project_id, auth.uid()))
  with check (public.is_project_owner(project_id, auth.uid()));
