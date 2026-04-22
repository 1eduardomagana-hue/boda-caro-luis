-- ═══════════════════════════════════════════════════════════
-- BODA CARO Y LUIS — Supabase Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── projects ──────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Boda Caro & Luis',
  event_date  date,
  location    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── app_settings ──────────────────────────────────────────
create table if not exists app_settings (
  key         text primary key,
  value       jsonb,
  updated_at  timestamptz default now()
);

-- ── notes_raw ─────────────────────────────────────────────
create table if not exists notes_raw (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  title       text,
  content     text,
  category    text,
  metadata    jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── providers ─────────────────────────────────────────────
create table if not exists providers (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade,
  name          text not null,
  category      text,
  contact       text,
  total_amount  numeric(12,2),
  paid_amount   numeric(12,2) default 0,
  balance       numeric(12,2),
  due_date      date,
  status        text default 'pendiente' check (status in ('pagado','parcial','pendiente')),
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── payments ──────────────────────────────────────────────
create table if not exists payments (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  provider_id uuid references providers(id) on delete cascade,
  concept     text not null,
  amount      numeric(12,2),
  paid_date   date,
  due_date    date,
  status      text default 'pendiente' check (status in ('pagado','pendiente','parcial')),
  notes       text,
  created_at  timestamptz default now()
);

-- ── guests ────────────────────────────────────────────────
create table if not exists guests (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  group_name  text not null,
  total       integer default 0,
  confirmed   integer default 0,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── events ────────────────────────────────────────────────
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  title       text not null,
  event_date  date,
  event_time  text,
  location    text,
  description text,
  type        text default 'otro',
  status      text default 'upcoming' check (status in ('past','upcoming','key')),
  is_urgent   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── checklist_items ───────────────────────────────────────
create table if not exists checklist_items (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  text        text not null,
  done        boolean default false,
  priority    text default 'media' check (priority in ('alta','media','baja')),
  due_date    date,
  category    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── links ─────────────────────────────────────────────────
create table if not exists links (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  title       text not null,
  url         text not null,
  category    text default 'Otros',
  note        text,
  created_at  timestamptz default now()
);

-- ── files ─────────────────────────────────────────────────
create table if not exists files (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  name        text not null,
  path        text not null,
  url         text,
  size        bigint,
  type        text,
  category    text,
  created_at  timestamptz default now()
);

-- ── categories ────────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  name        text not null,
  color       text,
  status      text,
  tasks       jsonb default '[]',
  created_at  timestamptz default now()
);

-- ── notes_structured ──────────────────────────────────────
create table if not exists notes_structured (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  note_raw_id uuid references notes_raw(id),
  field_type  text,
  field_key   text,
  field_value jsonb,
  created_at  timestamptz default now()
);

-- ── Storage bucket ────────────────────────────────────────
-- Run separately or via Supabase dashboard:
-- insert into storage.buckets (id, name, public) values ('wedding-files', 'wedding-files', true);

-- ── RLS: disable for private app (enable & add policies for multi-user) ──
alter table projects          disable row level security;
alter table app_settings      disable row level security;
alter table notes_raw         disable row level security;
alter table providers         disable row level security;
alter table payments          disable row level security;
alter table guests            disable row level security;
alter table events            disable row level security;
alter table checklist_items   disable row level security;
alter table links             disable row level security;
alter table files             disable row level security;
alter table categories        disable row level security;
alter table notes_structured  disable row level security;
