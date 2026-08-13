-- NEXUS — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) once your
-- project exists. Every table is scoped to the owning user via Row Level
-- Security; nothing here is reachable across accounts.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Shared helper: keep `updated_at` current on every UPDATE.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- profiles — one row per auth user, created on signup (see trigger below).
-- ─────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  -- Free-form settings bucket: AI response style, context permissions,
  -- notification preferences, etc. (spec §30) without over-normalizing.
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- projects
-- ─────────────────────────────────────────────────────────────────────────
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'planning'
    check (status in ('planning', 'active', 'paused', 'completed')),
  color text,
  progress smallint not null default 0 check (progress between 0 and 100),
  deadline timestamptz,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_owner_id_idx on public.projects(owner_id);

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- project_members — collaborators on a project (owner included as 'owner').
-- ─────────────────────────────────────────────────────────────────────────
create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index project_members_project_id_idx on public.project_members(project_id);
create index project_members_user_id_idx on public.project_members(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- tags / task_tags
-- ─────────────────────────────────────────────────────────────────────────
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table public.task_tags (
  task_id uuid not null,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- tasks (supports subtasks via parent_task_id)
-- ─────────────────────────────────────────────────────────────────────────
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'inbox'
    check (status in ('inbox', 'todo', 'in_progress', 'completed')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'critical')),
  due_date timestamptz,
  estimated_duration_minutes integer,
  position integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_owner_id_idx on public.tasks(owner_id);
create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_parent_task_id_idx on public.tasks(parent_task_id);

alter table public.task_tags
  add constraint task_tags_task_id_fkey
  foreign key (task_id) references public.tasks(id) on delete cascade;

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- notes
-- ─────────────────────────────────────────────────────────────────────────
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null default 'Untitled',
  content text not null default '',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_owner_id_idx on public.notes(owner_id);
create index notes_project_id_idx on public.notes(project_id);

create trigger set_notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- calendar_events
-- ─────────────────────────────────────────────────────────────────────────
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  all_day boolean not null default false,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_time_order check (end_time >= start_time)
);

create index calendar_events_owner_id_idx on public.calendar_events(owner_id);
create index calendar_events_start_time_idx on public.calendar_events(start_time);

create trigger set_calendar_events_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null
    check (type in ('task_due', 'project_update', 'ai_suggestion', 'calendar_reminder', 'task_completed')),
  title text not null,
  body text,
  is_read boolean not null default false,
  related_entity_type text check (related_entity_type in ('task', 'project', 'note', 'calendar_event')),
  related_entity_id uuid,
  created_at timestamptz not null default now()
);

create index notifications_owner_id_idx on public.notifications(owner_id);
create index notifications_owner_unread_idx on public.notifications(owner_id) where not is_read;

-- ─────────────────────────────────────────────────────────────────────────
-- activities — unified activity feed
-- ─────────────────────────────────────────────────────────────────────────
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  type text not null,
  description text not null,
  related_entity_type text check (related_entity_type in ('task', 'project', 'note', 'calendar_event')),
  related_entity_id uuid,
  created_at timestamptz not null default now()
);

create index activities_owner_id_idx on public.activities(owner_id);
create index activities_created_at_idx on public.activities(created_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- ai_conversations / ai_messages — context-scoped AI history
-- ─────────────────────────────────────────────────────────────────────────
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  context_type text check (context_type in ('global', 'project', 'note', 'task', 'calendar')),
  context_id uuid,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_conversations_owner_id_idx on public.ai_conversations(owner_id);

create trigger set_ai_conversations_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_updated_at();

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index ai_messages_conversation_id_idx on public.ai_messages(conversation_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security — every table is scoped to its owning user.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tags enable row level security;
alter table public.task_tags enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.calendar_events enable row level security;
alter table public.notifications enable row level security;
alter table public.activities enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

create policy "Users manage their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Owners manage their projects"
  on public.projects for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Members can view their projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = id and pm.user_id = auth.uid()
    )
  );

create policy "Project owners manage membership"
  on public.project_members for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

create policy "Members can view their own membership rows"
  on public.project_members for select
  using (user_id = auth.uid());

create policy "Owners manage their tags"
  on public.tags for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners manage their task tag links"
  on public.task_tags for all
  using (
    exists (select 1 from public.tasks t where t.id = task_id and t.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.tasks t where t.id = task_id and t.owner_id = auth.uid())
  );

create policy "Owners manage their tasks"
  on public.tasks for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners manage their notes"
  on public.notes for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners manage their calendar events"
  on public.calendar_events for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners manage their notifications"
  on public.notifications for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners view their activity feed"
  on public.activities for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners manage their AI conversations"
  on public.ai_conversations for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners manage their AI messages"
  on public.ai_messages for all
  using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.owner_id = auth.uid()
    )
  );
