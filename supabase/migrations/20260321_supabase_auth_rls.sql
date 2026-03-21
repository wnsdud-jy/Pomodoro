create extension if not exists pgcrypto;

do $$
declare
  auth_user_count bigint;
  owner_user_id uuid;
begin
  select count(*), min(id)
  into auth_user_count, owner_user_id
  from auth.users;

  if auth_user_count <> 1 then
    raise exception
      'Expected exactly one auth.users row for legacy Pomodoro backfill, found %',
      auth_user_count;
  end if;

  alter table public.sessions
    add column if not exists user_id uuid references auth.users (id) on delete cascade;

  update public.sessions
  set user_id = owner_user_id
  where user_id is null;

  alter table public.sessions
    alter column user_id set not null;

  alter table public.app_preferences
    add column if not exists user_id uuid references auth.users (id) on delete cascade;

  update public.app_preferences
  set user_id = owner_user_id
  where user_id is null;

  alter table public.app_preferences
    drop constraint if exists app_preferences_pkey;

  alter table public.app_preferences
    drop constraint if exists app_preferences_id_check;

  alter table public.app_preferences
    drop column if exists id;

  alter table public.app_preferences
    alter column user_id set not null;

  alter table public.app_preferences
    add constraint app_preferences_pkey primary key (user_id);

  alter table public.settings
    add column if not exists user_id uuid references auth.users (id) on delete cascade;

  update public.settings
  set user_id = owner_user_id
  where user_id is null;

  alter table public.settings
    drop constraint if exists settings_pkey;

  alter table public.settings
    drop constraint if exists settings_id_check;

  alter table public.settings
    drop column if exists id;

  alter table public.settings
    alter column user_id set not null;

  alter table public.settings
    add constraint settings_pkey primary key (user_id);
end $$;

drop index if exists public.sessions_ended_at_idx;
drop index if exists public.sessions_mode_idx;
drop index if exists public.sessions_completed_ended_at_idx;
drop index if exists public.sessions_completed_mode_ended_at_idx;
drop index if exists public.sessions_completed_tag_ended_at_idx;

create index if not exists sessions_user_id_ended_at_idx
  on public.sessions (user_id, ended_at desc);
create index if not exists sessions_user_id_completed_ended_at_idx
  on public.sessions (user_id, completed, ended_at desc);
create index if not exists sessions_user_id_completed_mode_ended_at_idx
  on public.sessions (user_id, completed, mode, ended_at desc);
create index if not exists sessions_user_id_completed_tag_ended_at_idx
  on public.sessions (user_id, completed, tag, ended_at desc);

alter table public.sessions enable row level security;
alter table public.app_preferences enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Users view own sessions" on public.sessions;
drop policy if exists "Users create own sessions" on public.sessions;
drop policy if exists "Users update own sessions" on public.sessions;
drop policy if exists "Users delete own sessions" on public.sessions;
drop policy if exists "Users manage own preferences" on public.app_preferences;
drop policy if exists "Users manage own settings" on public.settings;

create policy "Users view own sessions"
  on public.sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users create own sessions"
  on public.sessions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own sessions"
  on public.sessions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own sessions"
  on public.sessions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users manage own preferences"
  on public.app_preferences
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage own settings"
  on public.settings
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
