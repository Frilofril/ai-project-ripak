# Аудит безпеки ПР 7

Тема-15 · Спільна вікі вигаданого світу (`ai-project-ripak`)

## 1. Таблиця знахідок (5.1)

| № | Джерело | Назва знахідки | Критичність | Файл і рядок або об'єкт бази | Що зроблено | Доказ |
|---|---|---|---|---|---|---|
| З1 | Security Advisor | WARN: Leaked Password Protection Disabled | середня | Supabase Auth (`auth.users`) | Обґрунтовано в 5.2: функція перевірки паролів за базою витоків HaveIBeenPwned доступна лише на платному тарифі Supabase Pro; у застосунку задано мінімальну довжину пароля та не зберігаються платіжні дані | Обґрунтування в 5.2; С2 |
| З2 | Security Advisor | INFO: RLS Policy Always True on `SELECT` (`profiles_select`, `factions_select`) | низька | `public.profiles`, `public.factions` | Прийнято (низька): за специфікацією теми-15 будь-який авторизований учасник спільної вікі бачить довідник фракцій світу та імена авторів статей, а роль `anon` позбавлена доступу (`revoke all ... from anon`) | Перевірено прямим запитом без входу (`[]` / `permission denied`); С2, С3 |
| З3 | Аудит політик (запит 3) | Допоміжні функції `security definer` з ПР 5 (`handle_new_user`, `my_profile_id`, `my_role`, `can_see_article`, `can_edit_article`) | середня | Схема `public` (функції ПР 5) | Обґрунтовано в 5.2: функція `ai_app_calls_today()` вже має `revoke execute from public, anon`; допоміжні функції ПР 5 покладаються на `auth.uid()` (для `anon` повертають `null` / `false`), а таблиці закриті від `anon` | Розділ 5.2; запит 3 у SQL Editor |
| З4 | Лінтер / Ручна перевірка | Помилка ESLint `react/no-unescaped-entities` (неекранований апостроф у JSX) та перевірка пошукового фільтра `.or()` | середня | `app/login/page.tsx:130`, `lib/data/db/articles.ts` | Виправлено: неекранований апостроф у `app/login/page.tsx:130` замінено на `&apos;` (`0 errors`), пошук `.or()` захищений політикою RLS `articles_select` | Коміт `9be8ac3`; зелений `lint` у конвеєрі (С4) |

## 2. Аудит політик доступу (5.6)

| Таблиця | Політика | Дія | Кому | Умова своїми словами | Позначка запиту 2 | Що змінилося з ПР 5 |
|---|---|---|---|---|---|---|
| `profiles` | `profiles_select` | SELECT | `authenticated` | Кожен авторизований користувач бачить профілі авторів статей і скарг | норм | без змін |
| `profiles` | `profiles_update_own` | UPDATE | `authenticated` | Користувач змінює лише власний профіль (`user_id = auth.uid()`, колонка `full_name`) | норм | без змін |
| `factions` | `factions_select` | SELECT | `authenticated` | Авторизований користувач переглядає довідник фракцій світу | норм | без змін |
| `factions` | `factions_insert_editor` | INSERT | `authenticated` | Створювати фракції може лише користувач із роллю «редактор» (`my_role() = 'редактор'`) | норм | без змін |
| `factions` | `factions_update_editor` | UPDATE | `authenticated` | Оновлювати фракції може лише «редактор» | норм | без змін |
| `factions` | `factions_delete_editor` | DELETE | `authenticated` | Видаляти фракції може лише «редактор» | норм | без змін |
| `articles` | `articles_select` | SELECT | `authenticated` | Усі авторизовані бачать опубліковані статті; автор — свої; «редактор» — усі | норм | без змін |
| `articles` | `articles_insert_author` | INSERT | `authenticated` | Створюють статті лише «співавтор» і «редактор» від свого імені (`author_id = my_profile_id()`) | норм | без змін |
| `articles` | `articles_update_own_or_editor` | UPDATE | `authenticated` | Автор змінює власну чернетку/на перевірці; «редактор» змінює і публікує будь-яку статтю | норм | без змін |
| `articles` | `articles_delete_own_or_editor` | DELETE | `authenticated` | Видаляє статтю лише її автор або «редактор» | норм | без змін |
| `article_factions` | `article_factions_select` | SELECT | `authenticated` | Бачить прив'язку фракцій кожен, хто бачить статтю (`can_see_article(article_id)`) | норм | без змін |
| `article_factions` | `article_factions_insert_author` | INSERT | `authenticated` | Додає мітки фракцій лише автор статті або «редактор» (`can_edit_article(article_id)`) | норм | без змін |
| `article_factions` | `article_factions_delete_author` | DELETE | `authenticated` | Знімає мітки фракцій лише автор статті або «редактор» (`can_edit_article(article_id)`) | норм | без змін |
| `complaints` | `complaints_select_own_or_editor` | SELECT | `authenticated` | Бачить скаргу лише її автор (`reporter_id = my_profile_id()`) або «редактор» | норм | без змін |
| `complaints` | `complaints_insert_authenticated` | INSERT | `authenticated` | Подає скаргу «співавтор» або «редактор» від свого імені (`reporter_id = my_profile_id()`) | норм | без змін |
| `complaints` | `complaints_update_editor` | UPDATE | `authenticated` | Розглядає скаргу («вирішено» / «відхилено») лише «редактор» | норм | без змін |
| `ai_calls` | `ai_calls_insert_own` | INSERT | `authenticated` | Записує виклик моделі лише від свого імені (`user_id = auth.uid()`) | норм | додано в ПР 6 |
| `ai_calls` | `ai_calls_select_own` | SELECT | `authenticated` | Читає лише власні виклики моделі (`user_id = auth.uid()`); `update` і `delete` відкликано | норм | додано в ПР 6 |
| `ai_cache` | `ai_cache_select_own` | SELECT | `authenticated` | Читає лише власний кеш відповідей моделі (`user_id = auth.uid()`) | норм | додано в ПР 6 |
| `ai_cache` | `ai_cache_insert_own` | INSERT | `authenticated` | Додає запис у власний кеш (`user_id = auth.uid()`) | норм | додано в ПР 6 |
| `ai_cache` | `ai_cache_update_own` | UPDATE | `authenticated` | Оновлює лише власний кеш (`user_id = auth.uid()`); `delete` відкликано | норм | додано в ПР 6 |
| `storage.objects` | `wiki_media_select` | SELECT | `authenticated` | Перегляд файлів ілюстрацій у кошику `wiki-media` для статей, доступних за `can_see_article` | норм | без змін (ПР 5) |
| `storage.objects` | `wiki_media_insert` | INSERT | `authenticated` | Завантаження ілюстрацій у `wiki-media` лише автором статті або «редактором» (`can_edit_article`) | норм | без змін (ПР 5) |
| `storage.objects` | `wiki_media_update` | UPDATE | `authenticated` | Оновлення ілюстрацій у `wiki-media` лише автором статті або «редактором» | норм | без змін (ПР 5) |
| `storage.objects` | `wiki_media_delete` | DELETE | `authenticated` | Видалення ілюстрацій у `wiki-media` лише автором статті або «редактором» | норм | без змін (ПР 5) |

- **Тимчасових політик ПР 4 (`pr4_temp_all`):** 0.
- **Кошик Storage:** `wiki-media` (`public = false`, приватний).
- **Службовий ключ `SUPABASE_SERVICE_ROLE_KEY`:** ніде в коді застосунку чи тестах не використовується.
