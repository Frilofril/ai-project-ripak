# Копія діалогу з ШІ — Практична робота № 5
Тема 15: «Спільна вікі вигаданого світу»
Виконавець: Ріпак Ренат, група 1П-24

---

## Крок 3. Перелік точок доступу від моделі (Google AI Studio)

[№ 01] Ось карта екранів і схема даних:
Таблиця дій на екранах (5.1):
1. Головна (/): перегляд каталогу опублікованих статей із пошуком і фільтрами категорії та фракції (listPublishedArticles, listFactions) — усі авторизовані користувачі (лише опубліковані).
2. Перегляд статті (/articles/[id]): перегляд повного тексту статті, фракцій та ілюстрації (getArticle) — усі авторизовані (опубліковані), співавтор (власні чернетки), головний редактор (усі).
3. Перегляд статті (/articles/[id]): повернення статті в чернетки (returnToDraftAction) — співавтор (лише власна стаття), головний редактор (будь-яка).
4. Перегляд статті (/articles/[id]): подання скарги на опубліковану статтю (submitComplaintAction) — співавтор або головний редактор.
5. Редактор чернетки (/editor): відкриття форми редактора та списку фракцій (getArticle, listFactions) — співавтор (власна чернетка), головний редактор.
6. Редактор чернетки (/editor): створення або оновлення чернетки статті з фракціями (saveDraftAction) — співавтор (власна чернетка), головний редактор.
7. Редактор чернетки (/editor): видалення чернетки статті (deleteArticleAction) — співавтор (лише власна стаття), головний редактор.
8. Довідник фракцій (/factions): перегляд довідника фракцій із кількістю статей (listFactions) — будь-який авторизований користувач.
9. Довідник фракцій (/factions): створення нової фракції (createFactionAction) — лише головний редактор.
10. Довідник фракцій (/factions): видалення фракції з каскадним зняттям міток (deleteFactionAction) — лише головний редактор.
11. Панель модерації (/moderation): перегляд черги статей «на перевірці» та відкритих скарг (listModerationQueue, listComplaints) — лише головний редактор.
12. Панель модерації (/moderation): публікація статті або повернення в чернетки (moderateArticleAction) — лише головний редактор.
13. Панель модерації (/moderation): прийняття або відхилення скарги (resolveComplaintAction) — лише головний редактор.

Схема даних із docs/schema.md:
- profiles (id, full_name, role: 'гість' | 'співавтор' | 'редактор')
- factions (id, name, color_hex, description)
- articles (id, title, category, content, status: 'чернетка' | 'на перевірці' | 'опубліковано', image_url, author_id -> profiles.id, ai_summary)
- article_factions (article_id -> articles.id, faction_id -> factions.id)
- complaints (id, article_id -> articles.id, reporter_id -> profiles.id, reason, status: 'відкрита' | 'вирішено' | 'відхилено')

Склади перелік точок доступу: метод, шлях, вхідні дані, вихідні дані, коди помилок, хто має право викликати. Тільки перелік, коду не пропонуй.
Додатково:
(а) застосунок на Next.js 16 (App Router): точка доступу — це сторінка (GET, маршрут екрана) або серверна дія форми (POST на маршрут екрана);
(б) ролі зі spec.md: гість (читач), співавтор, головний редактор (редактор);
(в) коди помилок — лише з набору 200, 201, 400, 401, 403, 404;
(г) відповідь дай таблицею з колонками: №, Метод, Шлях, Сторінка або дія, Вхідні дані, Вихідні дані, Коди помилок, Хто має право, Екран.

**Відповідь AI Studio [№ 01]:**
Ось запропонований перелік точок доступу для застосунку «Спільна вікі вигаданого світу»:
1. `GET /` (`HomePage; listPublishedArticles, listFactions`) — вхідні: `category`, `factionId`, `query`; вихідні: `200`, список статей; коди: `401`; право: будь-який авторизований користувач; екран: Головна.
2. `GET /articles/[id]` (`ArticlePage; getArticle`) — вхідні: `id` (UUID); вихідні: `200`, стаття; коди: `401, 404`; право: усі авторизовані (опубліковані), співавтор (свої), редактор (усі); екран: Перегляд статті.
3. `POST /articles/[id]` (`returnToDraftAction`) — вхідні: `articleId` (UUID); вихідні: `200`; коди: `401, 404`; право: співавтор (власна стаття) або редактор; екран: Перегляд статті.
4. `POST /articles/[id]` (`submitComplaintAction`) — вхідні: `articleId` (UUID), `reason` (5–500 символів); вихідні: `201, id`; коди: `400, 401, 403, 404`; право: співавтор, редактор; екран: Перегляд статті.
5. `GET /editor` (`EditorPage; getArticle, listFactions`) — вхідні: `id` (необов'язковий UUID); вихідні: `200`, чернетка і фракції; коди: `401, 404`; право: співавтор (власна), редактор; екран: Редактор чернетки.
6. `POST /editor` (`saveDraftAction`) — вхідні: `id`, `title` (3–120), `category`, `content` (10–10000), `status`, `factionIds`; вихідні: `201 / 200, id`; коди: `400, 401, 403, 404`; право: співавтор (власна), редактор; екран: Редактор чернетки.
7. `POST /editor/ai-summary` (`generateAiSummaryAction`) — вхідні: `articleId`; вихідні: `200, ai_summary`; коди: `400, 401, 403`; право: співавтор, редактор; екран: Редактор чернетки. *(відсіяно на кроці 4 як поза MVP)*.
8. `GET /articles/[id]/revisions` (`RevisionsPage`) — вхідні: `id`; вихідні: `200`, історія правок; коди: `401, 404`; право: співавтор, редактор; екран: Історія ревізій. *(відсіяно на кроці 4 як поза MVP)*.
9. `GET /factions` (`FactionsPage; listFactions`) — вхідні: —; вихідні: `200`, список фракцій; коди: `401`; право: будь-який авторизований користувач; екран: Довідник фракцій.
10. `POST /factions` (`createFactionAction`) — вхідні: `name` (2–80), `colorHex` (`#RRGGBB`), `description` (5–500); вихідні: `201, id`; коди: `400, 401, 403`; право: лише редактор; екран: Довідник фракцій.
11. `POST /factions` (`deleteFactionAction`) — вхідні: `factionId` (UUID); вихідні: `200`; коди: `400, 401, 403, 404`; право: лише редактор; екран: Довідник фракцій.
12. `GET /moderation` (`ModerationPage; listModerationQueue, listComplaints`) — вхідні: —; вихідні: `200`, черга статей і скарг; коди: `401, 403`; право: лише редактор; екран: Панель модерації.
13. `POST /moderation` (`moderateArticleAction`) — вхідні: `articleId` (UUID), `decision` (`опубліковано` | `чернетка`); вихідні: `200`; коди: `400, 401, 403, 404`; право: лише редактор; екран: Панель модерації.
14. `POST /moderation` (`resolveComplaintAction`) — вхідні: `complaintId` (UUID), `decision` (`вирішено` | `відхилено`); вихідні: `200`; коди: `400, 401, 403, 404`; право: лише редактор; екран: Панель модерації.
15. `GET /api/profiles` (`listProfiles`) — вхідні: —; вихідні: `200`, список усіх профілів; коди: `401, 403`; право: лише редактор; екран: Адміністрування. *(відсіяно на кроці 4 — жоден екран не показує список усіх користувачів)*.

---

## Крок 7. Тести й червоний прогін (GitHub Copilot Chat)

[№ 02] Контекст: Next.js 16 (App Router), TypeScript, Vitest 3; серверні дії у `app/editor/actions.ts`, `app/articles/[id]/actions.ts`, `app/factions/actions.ts`, `app/moderation/actions.ts`; функції бази в `lib/data/db/articles.ts`; `tests/setup.ts` перед кожним тестом входить акаунтом А; `tests/helpers/users.ts` дає `signInAs("A" | "B")`; `tests/helpers/submit.ts` дає `submit(дія, поля)`.
Вхідні дані: 4 критерії з таблиці 7.1 та точки Т2, Т6, Т7 з таблиці 5.3:
1) `успішний виклик: співавтор створює чернетку статті, і вона є в базі` (Т6 `saveDraftAction` -> `201`, перевірка `getArticle`, очищення `deleteArticleAction`);
2) `невалідні дані: порожній заголовок статті повз форму відхиляється з кодом 400` (Т6 `saveDraftAction` з порожнім `title` -> `400` і `fieldErrors.title`);
3) `чужий запис: акаунт Б не бачить і не видаляє чернетку статті акаунта А` (А створює чернетку через `saveDraftAction` -> `201`; `signInAs("B")`; `getArticle` -> `null`; `deleteArticleAction` -> `404`; `signInAs("A")`; видалення);
4) `невалідна категорія: невідома категорія статті повз форму відхиляється з кодом 400` (Т6 `saveDraftAction` з `category: "невідома_категорія"` -> `400` і `fieldErrors.category`).
Завдання: створити файл `tests/actions-articles.test.ts` із цими 4 тестами.
Обмеження: не змінювати `app/`, `lib/`, `components/`, `supabase/`, `tests/setup.ts`, `tests/helpers/`, наявні тести, `package.json`, `vitest.config.ts`; без `vi.mock` і без службового ключа.

**Відповідь Copilot [№ 02]:**
Створено файл `tests/actions-articles.test.ts` з 4 інтеграційними тестами через `submit` та `signInAs`. Під час запуску `npm test` усі 4 нові тести падають із `AssertionError: expected +0 to be 201` (та `to be 400`), а 11 попередніх тестів проходять успішно.

---

## Крок 8. Валідація на сервері й точки доступу (GitHub Copilot Chat)

[№ 03] Контекст: Next.js 16, TypeScript; `lib/action-result.ts` (тип `ActionResult`, `isAccessDenied`); `lib/auth.ts` (`currentUserId()`); `components/action-form.tsx` (`ActionForm`); функції бази в `lib/data/db/`.
Вхідні дані: таблиця 5.3 (`docs/endpoints.md`); файли `app/editor/actions.ts`, `app/articles/[id]/actions.ts`, `app/factions/actions.ts`, `app/moderation/actions.ts` і відповідні сторінки `page.tsx`.
Завдання:
1) Створити `lib/validation/articles.ts`, `lib/validation/factions.ts`, `lib/validation/complaints.ts` для серверної перевірки полів `FormData` за обмеженнями таблиці 5.3 з повідомленнями українською мовою.
2) Оновити всі серверні дії на сигнатуру `(previous: ActionResult | null, formData: FormData) => Promise<ActionResult>`: без входу — `401`, невалідні дані — `400` з `fieldErrors`, виклик функцій `lib/data/db/`, при `isAccessDenied` — `403`, якщо запис не знайдено — `404`, при успіху — `revalidatePath` та `200` або `201` з `id`.
3) У сторінках замінити `<form action={...}>` на `<ActionForm action={...}>`.
Обмеження: не змінювати `tests/`, `lib/data/*.ts`, файли модуля входу, `supabase/`, `package.json`; без нових пакетів і без `redirect` у серверних діях.

**Відповідь Copilot [№ 03]:**
Створено файли валідації у `lib/validation/`, оновлено серверні дії та сторінки з `ActionForm` (водночас у `saveDraftAction` залишено `redirect` і запропоновано правку `tests/actions-articles.test.ts` — відхилено через Undo).

[№ 04] Уточнення: я відхилив зміну файлу `tests/actions-articles.test.ts`. Прибери виклик `redirect` із `saveDraftAction` у `app/editor/actions.ts`, щоб дія повертала об'єкт `ActionResult` зі статусом `201` (для нової чернетки) або `200` (для оновленої) та полем `id: saved.id`. Також додай перевірку формату UUID для `id` у `deleteArticleAction` та `returnToDraftAction` із поверненням коду `400`.

**Відповідь Copilot [№ 04]:**
Виправлено `app/editor/actions.ts` та `app/articles/[id]/actions.ts`: прибрано `redirect`, додано перевірку `isValidUuid(id)` із поверненням `status: 400`. Збирання `npm run build` проходить; у `docs/pr5-tests-step8.txt` тести «успішний виклик», «невалідні дані» та «невалідна категорія» зелені (`✓`), червоним лишається лише тест «чужий запис» (`×`).

--- кінець першого заняття ---

## Крок 10. Перша порада моделі щодо розмежування (Google AI Studio)

[№ 05] Контекст: застосунок Next.js 16 («Спільна вікі вигаданого світу»), база Supabase; користувачі входять через Supabase Auth; серверні дії й сторінки звертаються до бази з публічним ключем від імені користувача; зараз на всіх 5 таблицях (`profiles`, `factions`, `articles`, `article_factions`, `complaints`) стоїть тимчасова політика, що дозволяє все.
Вхідні дані: таблиця 5.3 (точки доступу Т1–Т13 із колонкою «Хто має право») та схема даних із 5 таблиць.
Завдання: поясни, як зробити, щоб кожен користувач виконував лише дозволені дії й бачив лише дозволені записи, і що змінити в коді та в базі.
Формат: для кожної точки доступу Т1–Т13 вкажи, де саме буде перевірка права і як вона виглядає.

**Відповідь AI Studio [№ 05]:**
Для розмежування доступу пропоную такий підхід по точках Т1–Т13:
- Т1 (`GET /`): у коді сторінки `app/page.tsx` або функції `listPublishedArticles` фільтрувати `.eq("status", "опубліковано")`.
- Т2 (`GET /articles/[id]`): у коді `app/articles/[id]/page.tsx` перевіряти `if (article.status !== 'опубліковано' && article.author_id !== user.id && role !== 'редактор') notFound()`.
- Т3 (`POST /articles/[id] returnToDraftAction`): у серверній дії перед оновленням перевірити `article.author_id === currentProfile.id`.
- Т4 (`POST /articles/[id] submitComplaintAction`): у серверній дії перевірити, що `currentProfile.role !== 'гість'`.
- Т5 (`GET /editor`): у `proxy.ts` або коді `app/editor/page.tsx` перевіряти роль користувача та власника чернетки.
- Т6 (`POST /editor saveDraftAction`): у серверній дії `saveDraftAction` перевіряти роль `співавтор` або `редактор` та `author_id` запису.
- Т7 (`POST /editor deleteArticleAction`): у серверній дії додати фільтр `.eq("author_id", currentProfile.id)` перед видаленням.
- Т8 (`GET /factions`): у `proxy.ts` перевіряється вхід користувача.
- Т9 (`POST /factions createFactionAction`): у серверній дії перевіряти `if (profile.role !== 'редактор') return { status: 403 }`.
- Т10 (`POST /factions deleteFactionAction`): у серверній дії перевіряти `if (profile.role !== 'редактор') return { status: 403 }`.
- Т11 (`GET /moderation`): у коді `app/moderation/page.tsx` перевіряти роль `редактор`, а для таблиці `complaints` увімкнути політику RLS `select` у базі.
- Т12 (`POST /moderation moderateArticleAction`): у серверній дії перевіряти `if (profile.role !== 'редактор') return { status: 403 }`.
- Т13 (`POST /moderation resolveComplaintAction`): у політиці RLS бази на таблиці `complaints` дозволити `update` лише для ролі `редактор`.

---

## Крок 11. SQL міграції доступу (Google AI Studio)

[№ 06] Контекст: Supabase, PostgreSQL 16; вхід через Supabase Auth (`auth.users`); тестові акаунти А і Б вже створені; є дві застосовані міграції ПР 4 (`20261106121500_create_schema.sql` та `20261106131000_add_articles_ai_summary.sql`).
Вхідні дані: повний вміст міграцій ПР 4 (5 таблиць: `profiles`, `factions`, `articles`, `article_factions`, `complaints`), таблиця 5.3 з правилами доступу для ролей `гість`, `співавтор`, `редактор` та контрольний список міграції доступу (пункти 1–9 роздаткового набору 5.4).
Завдання: написати одну нову міграцію, яка:
1) прив'язує `public.profiles` до `auth.users(id)` (`user_id uuid unique on delete cascade`);
2) створює тригер `handle_new_user()` та дозаповнює профілі для наявних користувачів `auth.users`;
3) створює допоміжні функції `my_profile_id()` і `my_role()` з `language sql stable security definer set search_path = ''`;
4) встановлює `default public.my_profile_id()` для `articles.author_id` і `complaints.reporter_id`;
5) видаляє тимчасову політику ПР 4 на всіх 5 таблицях;
6) відкликає `insert, update, delete` у ролі `anon` і обмежує `update` на `profiles` лише колонкою `full_name`;
7) створює політики RLS для `authenticated` на всіх 5 таблицях за ролями `гість`, `співавтор`, `редактор`.
Обмеження: попередні міграції не редагуються; без видалення таблиць, очищення даних, вимкнення RLS і службового ключа; політик для неавторизованих немає.
Формат: SQL одним блоком з українськими коментарями, потім таблиця політик.

**Відповідь AI Studio [№ 06]:**
Надано SQL міграції, проте в політиках `articles_select` та `article_factions_select` використано взаємні підзапити `exists (select 1 from public.articles ...)` без функції `security definer`, а на `profiles` залишено повний `grant update`.

[№ 07] Уточнення: винеси перевірку доступу до статті для таблиці `article_factions` у допоміжні функції `public.can_see_article(p_article_id uuid)` та `public.can_edit_article(p_article_id uuid)` з `language sql stable security definer set search_path = ''`, щоб уникнути рекурсії політик. Також додай `revoke update on public.profiles from authenticated; grant update (full_name) on public.profiles to authenticated;`, щоб користувач не міг сам підвищити собі роль до `редактор`.

**Відповідь AI Studio [№ 07]:**
Надано виправлений SQL-блок міграції з функціями `can_see_article`, `can_edit_article`, обмеженням `grant update (full_name) on public.profiles` та 16 політиками RLS для 5 таблиць.

---

## Крок 13. Аналіз доступу (Google AI Studio, у заданій ролі)

[№ 08] Ось мої точки доступу і політики доступу до таблиць:
[таблиця 5.3 (Т1–Т13) та повний вміст файлу `supabase/migrations/20261109123000_access_by_user.sql`].
Для кожної точки вкажи, що станеться, якщо її викличе користувач, якому цей запис не належить. Окремо познач ті, де перевірка тримається лише на коді інтерфейсу і обходиться прямим запитом до бази.
Додатково:
(а) серверні дії звертаються до бази з публічним ключем від імені користувача, службовий ключ не використовується;
(б) формат — таблиця «Точка (№) | Що станеться з чужим записом | Лише код інтерфейсу (так / ні)»;
(в) ти працюєш у заданій ролі аналітика: виправлень і коду не пропонуй.

**Відповідь AI Studio [№ 08]:**
Аналіз точок Т1–Т13 при виклику користувачем Б щодо чужого запису користувача А:
- Т1 (`GET /`): політика `articles_select` поверне лише опубліковані статті, чужі чернетки база не віддасть. Лише код інтерфейсу: ні.
- Т2 (`GET /articles/[id]`): для чужої чернетки політика `articles_select` поверне 0 рядків, `getArticle` дасть `null`, сторінка викличе `notFound()` (404). Лише код інтерфейсу: ні.
- Т3 (`POST /articles/[id] returnToDraftAction`): політика `articles_update_own_or_editor` не знайде чужий рядок для оновлення, дія поверне 404. Лише код інтерфейсу: ні.
- Т4 (`POST /articles/[id] submitComplaintAction`): політика `complaints_insert_authenticated` запише `reporter_id = my_profile_id()`, видати скаргу за чужу неможливо; для ролі `гість` база поверне відмову RLS (403). Лише код інтерфейсу: ні.
- Т5 (`GET /editor`): якщо передати `?id=` чужої чернетки, `articles_select` не поверне запис; проте сама порожня форма `/editor` відкривається для будь-якого авторизованого користувача. Лише код інтерфейсу: так (для перегляду порожньої форми роллю `гість`, хоча збереження заблоковане політикою `articles_insert_author`).
- Т6 (`POST /editor saveDraftAction`): при спробі змінити чужу чернетку політика `articles_update_own_or_editor` заблокує оновлення (404), а роль `гість` отримає 403 від `articles_insert_author`. Лише код інтерфейсу: ні.
- Т7 (`POST /editor deleteArticleAction`): політика `articles_delete_own_or_editor` не видалить чужий рядок (0 рядків), дія поверне 404. Лише код інтерфейсу: ні.
- Т8 (`GET /factions`): довідник фракцій спільний для читання всіма авторизованими за `factions_select`. Лише код інтерфейсу: ні.
- Т9 (`POST /factions createFactionAction`): для не-редактора політика `factions_insert_editor` відхилить запит (403). Лише код інтерфейсу: ні.
- Т10 (`POST /factions deleteFactionAction`): для не-редактора політика `factions_delete_editor` не видалить рядок (404/403). Лише код інтерфейсу: ні.
- Т11 (`GET /moderation`): для не-редактора політики `articles_select` і `complaints_select_own_or_editor` не віддадуть чужих чернеток на перевірці та чужих скарг. Лише код інтерфейсу: ні.
- Т12 (`POST /moderation moderateArticleAction`): політика `articles_update_own_or_editor` у `with check` дозволяє статус `опубліковано` лише для `my_role() = 'редактор'` (403/404). Лише код інтерфейсу: ні.
- Т13 (`POST /moderation resolveComplaintAction`): політика `complaints_update_editor` дозволяє зміну статусу скарги лише ролі `редактор` (404). Лише код інтерфейсу: ні.

---

## Крок 14. Заміна макетів (GitHub Copilot Chat)

[№ 09] Контекст: `lib/data/articles.ts`, `lib/data/factions.ts`, `lib/data/complaints.ts` — макетні модулі ПР 3; у `lib/data/db/` реалізовані однойменні функції для бази Supabase.
Завдання: у кожному файлі `lib/data/*.ts` залишити експорт типів, прибрати макетні масиви і `withMockMode`, та реекспортувати функції з `./db/...` (`export { ... } from "./db/..."`).
Обмеження: змінювати лише `lib/data/*.ts`; не змінювати `app/`, `components/`, `lib/data/db/`, `tests/`, `mock-mode.ts`.

**Відповідь Copilot [№ 09]:**
Оновлено файли `lib/data/articles.ts`, `lib/data/factions.ts`, `lib/data/complaints.ts`. Жоден файл у `app/` чи `components/` не змінено (`git diff --stat -- app components` порожній). Збирання `npm run build` та всі 15 тестів `npm test` проходять успішно.

---

## Крок 16. Складна складова — Supabase Storage (GitHub Copilot Chat)

[№ 10] Контекст: Next.js 16, Supabase Storage; політики доступу в `supabase/migrations/20261109123000_access_by_user.sql` вже містять функції `public.can_see_article(uuid)` та `public.can_edit_article(uuid)`.
Вхідні дані: специфікація функції Ф4 («Завантаження ілюстрацій та мап у Supabase Storage з правами доступу»), зразок 5.7.1 з роздаткового набору, порожній файл міграції `supabase/migrations/20261109132000_add_article_files.sql`, сторінки `/articles/[id]` та `/editor`.
Завдання:
1) Заповнити міграцію `20261109132000_add_article_files.sql`: створити приватний бакет `wiki-media` (до 1 МБ, типи PNG, JPEG, WEBP, PDF) і політики на `storage.objects` (`select` через `public.can_see_article`, `insert/update/delete` через `public.can_edit_article`).
2) Створити `lib/data/db/article-files.ts` із функціями `listArticleFiles(articleId)` (підписані посилання на 600 с) та `uploadArticleFile(articleId, file)`.
3) Додати серверну дію завантаження файлу з перевіркою розміру до 1 МБ, типу файлу і латинської назви та підключити її до сторінки статті `/articles/[id]` і редактора `/editor`.
Обмеження: не змінювати попередні міграції, `tests/` та файли модуля входу; без службового ключа.

**Відповідь Copilot [№ 10]:**
Заповнено міграцію `supabase/migrations/20261109132000_add_article_files.sql`, створено `lib/data/db/article-files.ts` та підключено завантаження і відображення ілюстрацій на `/articles/[id]` та `/editor`. `npm run build` та `npm test` (15 passed) виконано без помилок.
