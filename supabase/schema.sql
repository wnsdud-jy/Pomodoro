create extension if not exists pgcrypto;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('focus', 'short_break', 'long_break')),
  tag text,
  duration_seconds integer not null check (duration_seconds > 0),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  completed boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists sessions_ended_at_idx on public.sessions (ended_at desc);
create index if not exists sessions_mode_idx on public.sessions (mode);
create index if not exists sessions_completed_ended_at_idx
  on public.sessions (completed, ended_at desc);
create index if not exists sessions_completed_mode_ended_at_idx
  on public.sessions (completed, mode, ended_at desc);
create index if not exists sessions_completed_tag_ended_at_idx
  on public.sessions (completed, tag, ended_at desc);

alter table public.sessions enable row level security;

create table if not exists public.app_preferences (
  id text primary key check (id = 'singleton'),
  locale text not null default 'ko' check (locale in ('ko', 'en')),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.app_preferences (id)
values ('singleton')
on conflict (id) do nothing;

alter table public.app_preferences enable row level security;

create table if not exists public.settings (
  id text primary key check (id = 'singleton'),
  focus_minutes integer not null default 25 check (focus_minutes between 1 and 180),
  short_break_minutes integer not null default 5 check (short_break_minutes between 1 and 60),
  long_break_minutes integer not null default 15 check (long_break_minutes between 1 and 120),
  long_break_every integer not null default 4 check (long_break_every between 1 and 12),
  auto_advance boolean not null default true,
  auto_start_next boolean not null default false,
  sound_enabled boolean not null default true,
  notifications_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.settings (id)
values ('singleton')
on conflict (id) do nothing;

alter table public.settings enable row level security;
