alter table public.settings
  add column if not exists focus_duration_seconds integer,
  add column if not exists short_break_duration_seconds integer,
  add column if not exists long_break_duration_seconds integer;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'settings'
      and column_name = 'focus_minutes'
  ) then
    update public.settings
    set
      focus_duration_seconds = coalesce(focus_duration_seconds, greatest(focus_minutes, 1) * 60),
      short_break_duration_seconds = coalesce(short_break_duration_seconds, greatest(short_break_minutes, 1) * 60),
      long_break_duration_seconds = coalesce(long_break_duration_seconds, greatest(long_break_minutes, 1) * 60);

    alter table public.settings
      drop column if exists focus_minutes,
      drop column if exists short_break_minutes,
      drop column if exists long_break_minutes;
  end if;
end $$;

update public.settings
set
  focus_duration_seconds = coalesce(focus_duration_seconds, 1500),
  short_break_duration_seconds = coalesce(short_break_duration_seconds, 300),
  long_break_duration_seconds = coalesce(long_break_duration_seconds, 900);

alter table public.settings
  alter column focus_duration_seconds set default 1500,
  alter column focus_duration_seconds set not null,
  alter column short_break_duration_seconds set default 300,
  alter column short_break_duration_seconds set not null,
  alter column long_break_duration_seconds set default 900,
  alter column long_break_duration_seconds set not null;

alter table public.settings
  drop constraint if exists settings_focus_duration_seconds_check,
  drop constraint if exists settings_short_break_duration_seconds_check,
  drop constraint if exists settings_long_break_duration_seconds_check;

alter table public.settings
  add constraint settings_focus_duration_seconds_check check (focus_duration_seconds between 1 and 10800),
  add constraint settings_short_break_duration_seconds_check check (short_break_duration_seconds between 1 and 3600),
  add constraint settings_long_break_duration_seconds_check check (long_break_duration_seconds between 1 and 7200);
