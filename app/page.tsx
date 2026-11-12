import Link from "next/link";
import { listPublishedArticles } from "@/lib/data/articles";
import { listFactions } from "@/lib/data/factions";
import { db } from "@/lib/data/db/client";
import { signOutAction } from "@/app/login/actions";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; factionId?: string; query?: string }>;
}) {
  const params = await searchParams;
  const supabase = db();

  const [articles, factions, { data: authData }] = await Promise.all([
    listPublishedArticles(params),
    listFactions(),
    supabase.auth.getUser(),
  ]);

  let role = "гість";
  let displayName = authData.user?.email ?? "";

  if (authData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("user_id", authData.user.id)
      .maybeSingle();
    if (profile?.role) role = profile.role;
    if (profile?.full_name) displayName = profile.full_name;
  }

  const isEditor = role === "редактор";
  const factionMap = new Map(factions.map((f) => [f.id, f]));

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Спільна вікі вигаданого світу</h1>
          <p className="text-sm text-gray-600">Каталог опублікованих статей лору всесвіту (Ф1, Ф2)</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2.5 text-sm">
          <Link href="/editor" className="rounded bg-black px-3 py-1.5 text-white">
            + Нова чернетка
          </Link>
          <Link href="/factions" className="rounded border px-3 py-1.5 hover:bg-gray-50">
            Довідник фракцій
          </Link>
          {isEditor ? (
            <Link href="/moderation" className="rounded border px-3 py-1.5 hover:bg-gray-50">
              Панель модерації
            </Link>
          ) : null}

          {authData.user ? (
            <div className="flex items-center gap-2 rounded border bg-gray-50 px-3 py-1">
              <span className="font-medium text-gray-800">{displayName}</span>
              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs uppercase text-gray-700">
                {role}
              </span>
              <form action={signOutAction}>
                <button className="ml-1 text-xs font-medium text-red-600 hover:underline">
                  Вийти
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="rounded border px-3 py-1.5 hover:bg-gray-50">
              Увійти
            </Link>
          )}
        </nav>
      </header>

      <form method="GET" action="/" className="grid gap-3 rounded border bg-gray-50 p-4 sm:grid-cols-4">
        <input
          name="query"
          defaultValue={params.query ?? ""}
          placeholder="Пошук за назвою або текстом..."
          className="rounded border bg-white px-3 py-1.5"
        />
        <select
          name="category"
          defaultValue={params.category ?? "усі"}
          className="rounded border bg-white px-3 py-1.5"
        >
          <option value="усі">Усі категорії</option>
          <option value="персонаж">Персонаж</option>
          <option value="локація">Локація</option>
          <option value="подія">Подія</option>
          <option value="артефакт">Артефакт</option>
        </select>
        <select
          name="factionId"
          defaultValue={params.factionId ?? "усі"}
          className="rounded border bg-white px-3 py-1.5"
        >
          <option value="усі">Усі фракції</option>
          {factions.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 rounded bg-black px-3 py-1.5 text-white">
            Фільтрувати
          </button>
          <Link href="/" className="rounded border bg-white px-3 py-1.5 text-center">
            Скинути
          </Link>
        </div>
      </form>

      {articles.length === 0 ? (
        <section className="rounded border border-amber-300 bg-amber-50 p-6 text-center space-y-3">
          <p className="font-medium text-amber-900">
            За вашим запитом нічого не знайдено або в каталозі ще немає опублікованих статей
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/" className="rounded border bg-white px-3 py-1.5 text-sm">
              Очистити фільтри
            </Link>
            <Link href="/editor" className="rounded bg-black px-3 py-1.5 text-sm text-white">
              + Нова чернетка
            </Link>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {articles.map((article) => (
            <article key={article.id} className="flex flex-col justify-between rounded border bg-white p-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="rounded bg-gray-100 px-2 py-0.5 font-medium uppercase">
                    {article.category}
                  </span>
                  <span>Автор: {article.authorName}</span>
                </div>
                <h2 className="text-lg font-semibold">
                  <Link href={`/articles/${article.id}`} className="hover:underline">
                    {article.title}
                  </Link>
                </h2>
                <p className="line-clamp-3 text-sm text-gray-700">{article.content}</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                <div className="flex flex-wrap gap-1.5">
                  {article.factionIds.map((fid) => {
                    const f = factionMap.get(fid);
                    if (!f) return null;
                    return (
                      <span
                        key={fid}
                        className="rounded px-2 py-0.5 text-xs text-white"
                        style={{ backgroundColor: f.colorHex }}
                      >
                        {f.name}
                      </span>
                    );
                  })}
                </div>
                <Link href={`/articles/${article.id}`} className="text-sm font-medium underline">
                  Читати статтю →
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}