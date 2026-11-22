# Спільна вікі вигаданого світу (`ai-project-ripak`)

Навчальний проєкт курсу «Розробка ПЗ з використанням ШІ» (тема-15 · Спільна вікі вигаданого світу).

## 1. Призначення застосунку і ролі користувачів

Вебзастосунок для спільного створення, ілюстрування, модерації та перегляду статей лору вигаданого всесвіту з прив'язкою до фракцій, поданням скарг на порушення канону та автоматичною генерацією чернеток статей за нотаткою за допомогою мовної моделі.

- **Співавтор (`співавтор`)** — переглядає каталог опублікованих статей і довідник фракцій, створює та редагує власні чернетки статей, генерує чернетку статті за нотаткою (Ф8), завантажує файли ілюстрацій у сховище `wiki-media`, відправляє статті на перевірку та подає скарги на опубліковані статті.
- **Головний редактор (`редактор`)** — має всі права співавтора, а також керує довідником фракцій (створення, редагування, видалення), розглядає чергу статей «на перевірці» (публікує або повертає на доопрацювання) і вирішує або відхиляє подані скарги на сторінці `/moderation`.

## 2. Технологічний стек

- **Середовище виконання:** Node.js `v24.x`
- **Фреймворк:** Next.js `16.3.6` (App Router, Server Actions), React `19.2.8`, TypeScript `5`
- **Стилізація:** Tailwind CSS `4`
- **База даних, автентифікація і сховище файлів:** Supabase (PostgreSQL 16 + Row Level Security + Supabase Auth + Supabase Storage)
- **Мовна модель:** Groq API (`openai/gpt-oss-20b`) або Google Gemini API (`gemini-2.5-flash-lite`)
- **Тестування та статичний аналіз:** Vitest `3.2.7`, ESLint `9`, GitHub Actions (`lint`, `test`, `secrets`, `CodeQL`)
- **Розгортання:** Vercel (`https://ai-project-ripak.vercel.app`)

## 3. Зовнішні сервіси для запуску з нуля

Для запуску власної копії проєкту потрібні лише безкоштовні облікові записи:
1. **GitHub** (репозиторій та хмарне середовище розробки **GitHub Codespaces**).
2. **Supabase** (хмарний проєкт бази даних PostgreSQL, Auth і Storage — локальний Docker не потрібен).
3. **Groq Console** (`https://console.groq.com`) або **Google AI Studio** (`https://aistudio.google.com`) — для отримання безкоштовного API-ключа мовної моделі.

## 4. Відкриття репозиторію у GitHub Codespaces та встановлення залежностей

1. Відкрийте репозиторій на GitHub, натисніть зелену кнопку **`Code` → вкладка `Codespaces` → `Create codespace on main`**.
2. Дочекайтеся відкриття VS Code у браузері та запустіть у терміналі встановлення пакетів:
   ```bash
   npm install
   ```

## 5. Створення проєкту Supabase та вимкнення підтвердження пошти

1. Увійдіть у панель [Supabase](https://supabase.com/dashboard) і натисніть **`New project`**.
2. Вкажіть назву проєкту, пароль бази даних і регіон (наприклад, `Central EU (Frankfurt)`) та зачекайте ~1–2 хвилини до завершення створення.
3. Перейдіть у меню **`Authentication` → `Providers` → `Email`**, вимкніть перемикач **`Confirm email`** і натисніть **`Save`** (щоб тестові користувачі могли реєструватися й входити без підтвердження листа).

## 6. Застосування міграцій бази даних

У каталозі `supabase/migrations/` містяться 4 файли міграцій, які потрібно виконати у **`SQL Editor` → `New query`** панелі Supabase **суворо в такому порядку**:

1. `supabase/migrations/20261015142000_init_schema.sql` — створення таблиць `profiles`, `factions`, `articles`, `article_factions`, `complaints`, індексів і тригера профілю.
2. `supabase/migrations/20261109123000_access_by_user.sql` — видалення тимчасових політик, створення допоміжних функцій (`my_profile_id`, `my_role`, `can_see_article`, `can_edit_article`) і 16 політик RLS за ролями.
3. `supabase/migrations/20261109132000_add_article_files.sql` — додавання колонок файлів ілюстрацій та створення приватного кошика `wiki-media` і 4 політик `storage.objects`.
4. `supabase/migrations/20261119213000_ai_guard.sql` — створення таблиць лімітів і кешу мовної моделі (`ai_calls`, `ai_cache`), їхніх політик RLS та функції `ai_app_calls_today()`.

Або застосуйте всі 4 міграції однією командою з термінала Codespace через Supabase CLI:
```bash
npx supabase db push --db-url "postgresql://postgres:[ВАШ_ПАРОЛЬ_БД]@db.[ВАШ_PROJECT_REF].supabase.co:5432/postgres"
```

## 7. Налаштування сховища файлів (Supabase Storage)

Міграція `20261109132000_add_article_files.sql` автоматично створює приватний кошик **`wiki-media`** (`public = false`) та 4 політики доступу (`wiki_media_select`, `wiki_media_insert`, `wiki_media_update`, `wiki_media_delete`). Переконайтеся в розділі **`Storage` → `Buckets`** панелі Supabase, що кошик `wiki-media` присутній і має статус **Private**.

## 8. Змінні середовища (`.env.local`)

Скопіюйте шаблон `.env.example` у файл `.env.local`:
```bash
cp .env.example .env.local
```

Заповніть у `.env.local` усі змінні:

| Змінна | Де взяти значення | Обов'язкова | Що буде без неї |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → `Project Settings` → `Data API` → `Project URL` | Так | Застосунок і тести не зможуть підключитися до бази даних |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → `Project Settings` → `API Keys` → `anon` `public` | Так | Відмова автентифікації та клієнта БД |
| `TEST_USER_A_EMAIL` | Пошта тестового акаунта А (наприклад, `user+a@gmail.com`) | Для `npm test` | Інтеграційні тести не зможуть увійти під головним редактором |
| `TEST_USER_B_EMAIL` | Пошта тестового акаунта Б (наприклад, `user+b@gmail.com`) | Для `npm test` | Тести розмежування доступу між авторами не запустяться |
| `TEST_USER_PASSWORD` | Спільний пароль тестових акаунтів А і Б (від 6 символів) | Для `npm test` | Тести не зможуть пройти автентифікацію |
| `AI_PROVIDER` | `groq` (рекомендовано) або `gemini` | Ні (за замовч. `gemini`) | Використовуватиметься провайдер за замовчуванням |
| `GROQ_API_KEY` | Groq Console → `API Keys` → `Create API Key` (`gsk_...`) | Для функції ШІ (Ф8) | Генерація чернетки за нотаткою на `/editor` покаже банер недоступності, решта сайту працюватиме |
| `GEMINI_API_KEY` | Google AI Studio → `Get API key` (`AIza...`) | Якщо `AI_PROVIDER=gemini` | Без ключа генерація чернетки за нотаткою буде вимкнена |

## 9. Створення тестових користувачів А і Б та призначення ролі «редактор»

1. Запустіть сервер розробки (`npm run dev`), відкрийте сторінку `/login` і зареєструйте два тестові акаунти з поштами `TEST_USER_A_EMAIL` і `TEST_USER_B_EMAIL` та паролем `TEST_USER_PASSWORD`.
2. У панелі Supabase відкрийте **`SQL Editor` → `New query`** і призначте акаунту А роль **`редактор`** (замініть пошту на вашу `TEST_USER_A_EMAIL`):
   ```sql
   update public.profiles
   set role = 'редактор'
   where email = 'ваша_пошта+a@gmail.com';
   ```
   (Акаунт Б залишається з роллю `співавтор`, яка призначається автоматично при реєстрації).

## 10. Запуск у режимі розробки

Виконайте в терміналі Codespace:
```bash
npm run dev
```
Відкрийте вкладку **`Порти` (`Ports`)** у нижній панелі VS Code і натисніть іконку глобуса біля порту **`3000`** (`http://localhost:3000`).

## 11. Запуск автоматичних тестів і лінтера

Для перевірки всіх 22 інтеграційних тестів і статичного аналізу ESLint виконайте:
```bash
npm test
npm run lint
```
Очікуваний результат `npm test`:
```text
Test Files  5 passed (5)
     Tests  22 passed (22)
```

## 12. Розгортання на Vercel і налаштування конвеєра GitHub Actions

- **Vercel:** Імпортуйте репозиторій у [Vercel](https://vercel.com), у розділі **`Settings` → `Environment Variables`** додайте `NEXT_PUBLIC_SUPABASE_URL` (тип `Config`), `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AI_PROVIDER=groq` та окремі ключі `GROQ_API_KEY` для середовищ **Production** і **Preview**, після чого натисніть **`Deploy`**.
- **GitHub Actions:** У репозиторії на GitHub відкрийте **`Settings` → `Secrets and variables` → `Actions`** і додайте 5 секретів репозиторію: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TEST_USER_A_EMAIL`, `TEST_USER_B_EMAIL`, `TEST_USER_PASSWORD`. Конвеєр `.github/workflows/ci.yml` автоматично запускає перевірки `lint`, `test` і `secrets` на кожному `push` та `pull_request` у `main`.
