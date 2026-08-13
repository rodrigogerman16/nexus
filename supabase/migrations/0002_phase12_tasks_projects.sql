-- NEXUS — Phase 12: real backend wiring for Tasks & Projects
-- Run this in the Supabase SQL editor (or via `supabase db push`) after
-- 0001_init.sql. Adds the two columns the app's Task/Project types need
-- that weren't in the original schema.

-- Projects render with a lucide icon name (spec §16); the app always sends
-- one, so a NOT NULL default keeps existing rows valid.
alter table public.projects
  add column icon text not null default 'Folder';

-- Tags are simple free-text strings on a task (see TagInput in the UI),
-- not the normalized tags/task_tags tables — those stay unused for now.
alter table public.tasks
  add column tags text[] not null default '{}'::text[];
