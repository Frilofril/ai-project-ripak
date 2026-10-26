import Link from "next/link";
import { listPublishedArticles } from "@/lib/data/articles";
import { listFactions } from "@/lib/data/factions";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; faction?: string; q?: string }>;
}) {
  const { category = "all", faction = "all", q = "" } = await searchParams;
  const [articles, factions] = await Promise.all([
    listPublishedArticles({ category, factionId: faction, query: q }),
    listFactions(),
  ]);

  const factionMap = new Map(factions.map((f) => [f.id, f.name]));

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center">
            В
          </div>
          <div>
            <h1 className="font-bold text-lg">Вікі всесвіту</h1>
            <p className="text-xs text-slate-500">Спільна енциклопедія</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-medium text-indigo-600">
            Каталог
          </Link>
          <Link href="/factions" className="text-slate-700 hover:underline">
            Довідник фракцій
          </Link>
          <Link href="/moderation" className="text-slate-700 hover:underline">
            Модерація
          </Link>
          <Link
            href="/editor"
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium"
          >
            + Нова чернетка
          </Link>
        </nav>
      </header>

      <section className="p-5 border rounded-xl bg-white space-y-4">
        <div>
          <h2 className="text-xl font-bold">Каталог статей (Ф1, Ф2)</h2>
          <p className="text-sm text-slate-600">
            База матеріалів. Обирайте категорію або фільтруйте статті за фракціями.
          </p>
        </div>

        <form method="GET" action="/" className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Пошук за назвою або текстом (Ф2)..."
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <select
            name="category"
            defaultValue={category}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">Усі категорії (Ф1)</option>
            <option value="персонаж">Персонаж</option>
            <option value="локація">Локація</option>
            <option value="подія">Подія</option>
          </select>
          <select
            name="faction"
            defaultValue={faction}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">Усі фракції (Ф1)</option>
            {factions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
              Застосувати
            </button>
            <Link
              href="/"
              className="px-3 py-2 border rounded-lg text-sm flex items-center"
            >
              Очистити
            </Link>
          </div>
        </form>
      </section>

      {articles.length === 0 ? (
        <div className="p-6 border rounded-xl bg-amber-50 text-amber-900 space-y-3">
          <p className="font-medium">
            За вашим запитом нічого не знайдено або в каталозі ще немає опублікованих статей
          </p>
          <div className="flex gap-3 text-sm">
            <Link href="/" className="px-3 py-1.5 bg-white border rounded-lg">
              Очистити фільтри
            </Link>
            <Link
              href="/editor"
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg"
            >
              + Нова чернетка
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.map((article) => (
            <article
              key={article.id}
              className="p-5 border rounded-xl bg-white flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 bg-slate-100 rounded font-medium capitalize">
                    {article.category}
                  </span>
                  <span className="text-slate-500">Автор: {article.authorName}</span>
                </div>
                <h3 className="font-bold text-lg">{article.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3">
                  {article.content}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {article.factionIds.map((fid) => (
                    <span
                      key={fid}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs"
                    >
                      {factionMap.get(fid) ?? fid}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t text-xs">
                <span className="text-emerald-700 font-medium">Опубліковано</span>
                <Link
                  href={`/articles/${article.id}`}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Читати статтю →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
