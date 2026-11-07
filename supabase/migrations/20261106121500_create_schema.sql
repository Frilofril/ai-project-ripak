-- Міграція 1: схема даних від екранів (практична робота 4).
-- Тема 15: «Спільна вікі вигаданого світу».

-- Користувачі, яких показують екрани (ім'я автора та роль).
-- Зв'язок з обліковими записами входу з'явиться в ПР 5 окремою міграцією.
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) > 0),
  role text not null default 'співавтор' check (role in ('гість', 'співавтор', 'редактор'))
);

-- Довідник фракцій світу (екран «Довідник фракцій» та мітки на статтях).
create table public.factions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  color_hex text not null default '#3b82f6' check (length(trim(color_hex)) > 0),
  description text not null check (length(trim(description)) > 0)
);

-- Статті енциклопедії всесвіту (екрани «Головна», «Перегляд статті», «Редактор чернетки», «Панель модерації»).
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  category text not null check (category in ('персонаж', 'локація', 'подія', 'артефакт')),
  content text not null check (length(trim(content)) > 0),
  status text not null default 'чернетка' check (status in ('чернетка', 'на перевірці', 'опубліковано')),
  image_url text,
  author_id uuid references public.profiles (id) on delete set null
);

-- Прив'язка статей до фракцій: зв'язок «багато до багатьох» між статтями й фракціями.
create table public.article_factions (
  article_id uuid not null references public.articles (id) on delete cascade,
  faction_id uuid not null references public.factions (id) on delete cascade,
  primary key (article_id, faction_id)
);

-- Скарги користувачів на опубліковані статті (екрани «Перегляд статті» та «Панель модерації»).
create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  reporter_id uuid references public.profiles (id) on delete set null,
  reason text not null check (length(trim(reason)) > 0),
  status text not null default 'відкрита' check (status in ('відкрита', 'вирішено', 'відхилено'))
);

-- Політики доступу на рівні рядка вмикаються одразу, тією самою міграцією.
alter table public.profiles enable row level security;
alter table public.factions enable row level security;
alter table public.articles enable row level security;
alter table public.article_factions enable row level security;
alter table public.complaints enable row level security;

-- ТИМЧАСОВО, замінюється в ПР 5: доступ для всіх, хто має публічний ключ.
create policy "pr4_temp_all" on public.profiles
  for all to anon, authenticated using (true) with check (true);
create policy "pr4_temp_all" on public.factions
  for all to anon, authenticated using (true) with check (true);
create policy "pr4_temp_all" on public.articles
  for all to anon, authenticated using (true) with check (true);
create policy "pr4_temp_all" on public.article_factions
  for all to anon, authenticated using (true) with check (true);
create policy "pr4_temp_all" on public.complaints
  for all to anon, authenticated using (true) with check (true);

-- Права ролей на таблиці: без них сервіс даних Supabase відповідає
-- «permission denied for table …».
-- ТИМЧАСОВО, замінюється в ПР 5: роль anon (без входу) має право на запис лише до появи входу.
grant select, insert, update, delete on public.profiles to anon, authenticated, service_role;
grant select, insert, update, delete on public.factions to anon, authenticated, service_role;
grant select, insert, update, delete on public.articles to anon, authenticated, service_role;
grant select, insert, update, delete on public.article_factions to anon, authenticated, service_role;
grant select, insert, update, delete on public.complaints to anon, authenticated, service_role;
