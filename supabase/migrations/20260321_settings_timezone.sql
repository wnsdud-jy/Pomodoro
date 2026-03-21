alter table public.settings
  add column if not exists timezone text not null default 'Asia/Seoul';
