import Link from "next/link";
import { getArticle } from "@/lib/data/articles";
import { listFactions } from "@/lib/data/factions";
import {
  returnToDraftFromViewAction,
  submitComplaintAction,
} from "./actions";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, factions] = await Promise.all([
    getArticle(id),
    listFactions(),
  ]);

  if (!article) {
    return (
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="p-6 border rounded-xl bg-amber-50 text-amber-900 space-y-3">
          <p className="font-medium">
            Статтю не знайдено або її було знято з публікації у чернетки після модерації
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            ← Назад до каталогу
          </Link>
        </div>
      </main>
    );
  }

  const factionMap = new Map(factions.map((f) => [f.id, f.name]));

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between border-b pb-4 text-sm">
        <Link href="/" className="font-medium hover:underline">
          ← Назад до каталогу
        </Link>
        <div className="flex gap-4">
          <Link href="/editor" className="text-slate-700 hover:underline">
            Редактор
          </Link>
          <Link href="/factions" className="text-slate-700 hover:underline">
            Фракції
          </Link>
        </div>
      </header>

      <article className="p-6 border rounded-xl bg-white space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">
              {article.status} (Ф1)
            </span>
            <span className="text-slate-500">ID статті: #{article.id}</span>
          </div>
          <span className="text-slate-500">Автор: {article.authorName}</span>
        </div>

        <h1 className="text-2xl font-bold">{article.title}</h1>

        <div className="flex flex-wrap gap-2">
          {article.factionIds.map((fid) => (
            <span
              key={fid}
              className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs"
            >
              {factionMap.get(fid) ?? fid}
            </span>
          ))}
        </div>

        <div className="p-6 border border-dashed rounded-xl bg-slate-50 text-center space-y-1">
          <p className="text-sm font-medium text-slate-700">
            Ілюстрація статті зі сховища Supabase Storage (Ф4)
          </p>
          <p className="text-xs text-slate-500 font-mono">
            {article.imageUrl || "storage://wiki-media/default-map.webp"}
          </p>
          <p className="text-xs text-indigo-600">
            {article.status === "опубліковано"
              ? "Опублікований файл доступний для всіх відвідувачів"
              : "Файл чернетки захищений (доступний лише автору та Головному редактору)"}
          </p>
        </div>

        <p className="text-slate-700 leading-relaxed">{article.content}</p>

        {article.status !== "чернетка" && (
          <form action={returnToDraftFromViewAction} className="pt-2">
            <input type="hidden" name="articleId" value={article.id} />
            <button
              type="submit"
              className="px-3 py-1.5 border rounded-lg text-xs hover:bg-slate-50"
            >
              Повернути в чернетки для редагування (Ф3.3)
            </button>
          </form>
        )}
      </article>

      <section className="p-6 border border-red-200 rounded-xl bg-red-50/40 space-y-3">
        <h2 className="font-bold text-red-900">Поскаржитися на статтю (Ф7)</h2>
        <form action={submitComplaintAction} className="space-y-3">
          <input type="hidden" name="articleId" value={article.id} />
          <textarea
            name="reason"
            required
            placeholder="Вкажіть причину звернення..."
            className="w-full border rounded-lg p-3 text-sm bg-white"
            rows={3}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
          >
            Надіслати скаргу
          </button>
        </form>
      </section>
    </main>
  );
}
