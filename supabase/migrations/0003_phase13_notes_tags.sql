-- NEXUS — Phase 13: real backend wiring for Notes & Calendar
-- Run this in the Supabase SQL editor (or via `supabase db push`) after
-- 0002_phase12_tasks_projects.sql. calendar_events already has every column
-- the app needs; notes is missing tags, same gap tasks had before 0002.

alter table public.notes
  add column tags text[] not null default '{}'::text[];
