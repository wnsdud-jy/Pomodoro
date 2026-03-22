create extension if not exists pgcrypto;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'sessions'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sessions'
      and column_name = 'user_id'
  ) then
    raise exception
      'Legacy public.sessions table detected without user_id. Run supabase/migrations/20260321_supabase_auth_rls.sql instead of applying supabase/schema.sql directly.';
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'app_preferences'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'app_preferences'
      and column_name = 'user_id'
  ) then
    raise exception
      'Legacy public.app_preferences table detected without user_id. Run supabase/migrations/20260321_supabase_auth_rls.sql instead of applying supabase/schema.sql directly.';
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'settings'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'settings'
      and column_name = 'user_id'
  ) then
    raise exception
      'Legacy public.settings table detected without user_id. Run supabase/migrations/20260321_supabase_auth_rls.sql instead of applying supabase/schema.sql directly.';
  end if;
end $$;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('focus', 'short_break', 'long_break')),
  tag text,
  duration_seconds integer not null check (duration_seconds > 0),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  completed boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_ended_at_idx
  on public.sessions (user_id, ended_at desc);
create index if not exists sessions_user_id_completed_ended_at_idx
  on public.sessions (user_id, completed, ended_at desc);
create index if not exists sessions_user_id_completed_mode_ended_at_idx
  on public.sessions (user_id, completed, mode, ended_at desc);
create index if not exists sessions_user_id_completed_tag_ended_at_idx
  on public.sessions (user_id, completed, tag, ended_at desc);

alter table public.sessions enable row level security;

create table if not exists public.app_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  locale text not null default 'ko' check (locale in ('ko', 'en')),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_preferences enable row level security;

create table if not exists public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  focus_duration_seconds integer not null default 1500 check (focus_duration_seconds between 1 and 10800),
  short_break_duration_seconds integer not null default 300 check (short_break_duration_seconds between 1 and 3600),
  long_break_duration_seconds integer not null default 900 check (long_break_duration_seconds between 1 and 7200),
  long_break_every integer not null default 4 check (long_break_every between 1 and 12),
  timezone text not null default 'Asia/Seoul',
  auto_advance boolean not null default true,
  auto_start_next boolean not null default false,
  sound_enabled boolean not null default true,
  notifications_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.settings
  add column if not exists timezone text not null default 'Asia/Seoul';

alter table public.settings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sessions'
      and policyname = 'Users view own sessions'
  ) then
    create policy "Users view own sessions"
      on public.sessions
      for select
      to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sessions'
      and policyname = 'Users create own sessions'
  ) then
    create policy "Users create own sessions"
      on public.sessions
      for insert
      to authenticated
      with check ((select auth.uid()) = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sessions'
      and policyname = 'Users update own sessions'
  ) then
    create policy "Users update own sessions"
      on public.sessions
      for update
      to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sessions'
      and policyname = 'Users delete own sessions'
  ) then
    create policy "Users delete own sessions"
      on public.sessions
      for delete
      to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'app_preferences'
      and policyname = 'Users manage own preferences'
  ) then
    create policy "Users manage own preferences"
      on public.app_preferences
      for all
      to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'settings'
      and policyname = 'Users manage own settings'
  ) then
    create policy "Users manage own settings"
      on public.settings
      for all
      to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end $$;
