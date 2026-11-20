-- Лічильники викликів моделі та кеш відповідей (практична робота 6, тема-15 «Спільна вікі вигаданого світу»).
create table public.ai_calls (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  cached boolean not null default false,
  created_at timestamptz not null default now()
);

create index ai_calls_user_time on public.ai_calls (user_id, created_at);

create table public.ai_cache (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null,
  output text not null check (length(output) <= 20000),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.ai_calls enable row level security;
alter table public.ai_cache enable row level security;

revoke all on public.ai_calls, public.ai_cache from anon;
revoke update, delete on public.ai_calls from authenticated;

create policy "ai_calls_insert_own" on public.ai_calls
  for insert to authenticated with check (user_id = auth.uid());

create policy "ai_calls_select_own" on public.ai_calls
  for select to authenticated using (user_id = auth.uid());

revoke delete on public.ai_cache from authenticated;

create policy "ai_cache_select_own" on public.ai_cache
  for select to authenticated using (user_id = auth.uid());

create policy "ai_cache_insert_own" on public.ai_cache
  for insert to authenticated with check (user_id = auth.uid());

create policy "ai_cache_update_own" on public.ai_cache
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create function public.ai_app_calls_today() returns integer
  language sql stable security definer set search_path = '' as $fn$
  select count(*)::integer from public.ai_calls
  where cached = false and created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc'
$fn$;

revoke execute on function public.ai_app_calls_today() from public, anon;
grant execute on function public.ai_app_calls_today() to authenticated;
