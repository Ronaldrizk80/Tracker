-- ============================================================
-- Follow-Up Tracker — Supabase schema
-- Run this in your Supabase project's SQL Editor (one-time setup)
-- ============================================================

-- Enable required extension for UUID generation
create extension if not exists "pgcrypto";

-- ============ Tasks table ============
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  notes         text,
  type          text not null check (type in ('delegated', 'email_reply', 'project')),
  entity        text not null,
  counterparty  text,
  status        text not null default 'open' check (status in ('open', 'waiting', 'snoozed', 'done')),
  due_date      date,
  snooze_until  date,
  last_nudge_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Helpful indexes
create index if not exists tasks_user_idx        on public.tasks(user_id);
create index if not exists tasks_user_status_idx on public.tasks(user_id, status);
create index if not exists tasks_user_due_idx    on public.tasks(user_id, due_date);

-- ============ Row-level security ============
alter table public.tasks enable row level security;

-- Drop any existing policies (idempotent re-run)
drop policy if exists "Users can read own tasks"   on public.tasks;
drop policy if exists "Users can insert own tasks" on public.tasks;
drop policy if exists "Users can update own tasks" on public.tasks;
drop policy if exists "Users can delete own tasks" on public.tasks;

create policy "Users can read own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- ============ Enable realtime ============
-- In the Supabase Dashboard:
--   Database → Replication → enable "tasks" table
-- (Or run this SQL — same effect)
alter publication supabase_realtime add table public.tasks;
