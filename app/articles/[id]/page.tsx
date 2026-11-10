import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { getArticle } from "@/lib/data/articles";
import { listFactions } from "@/lib/data/factions";
import { listArticleFiles } from "@/lib/data/db/article-files";
import { returnToDraftAction, submitComplaintAction, uploadArticleImageAction } from "./actions";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, factions, files] = await Promise.all([
    getArticle(id),
    listFactions(),
    listArticleFiles(id),
  ]);

  if (!article) {
    notFound();
  }

  const attachedFactions = factions.filter((f) => article.factionIds.includes(f.id));

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <nav className="flex items-center justify-between border-b pb-3 text-sm">
        <Link href="/" className="underline">
          ← Назад до каталогу
        </Link>
        <div className="flex gap-3">
          <Link href={`/editor?id=${article.id}`} className="rounded border px-3 py-1">
            Редагувати у /editor
          </Link>
          <Link href="/factions" className="rounded border px-3 py-1">
            Довідник фракцій
          </Link>
        </div>
      </nav>

      <article className="space-y-4 rounded border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
          <span className="rounded bg-gray-100 px-2.5 py-1 font-semibold uppercase">
            Категорія: {article.category}
          </span>
          <span className="rounded border px-2.5 py-1">
            Статус: <strong>{article.status}</strong>
          </span>
          <span>Автор: {article.authorName}</span>
        </div>

        <h1 className="text-2xl font-bold">{article.title}</h1>

        {attachedFactions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {attachedFactions.map((f) => (
              <span
                key={f.id}
                className="rounded px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: f.colorHex }}
              >
                {f.name}
              </span>
            ))}
          </div>
        ) : null}

        <p className="whitespace-pre-line text-base leading-relaxed text-gray-800">
          {article.content}
        </p>

        <section className="space-y-3 border-t pt-4">
          <h2 className="text-lg font-semibold">Ілюстрації та мапи статті (Supabase Storage, Ф4)</h2>
          {article.imageUrl ? (
            <p className="text-xs text-gray-500">Поточний шлях у записі: {article.imageUrl}</p>
          ) : null}
          {files.length > 0 ? (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {files.map((f) => (
                <li key={f.name}>
                  <a href={f.url} target="_blank" rel="noreferrer" className="underline">
                    {f.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Файлів у приватному сховищі для цієї статті ще немає.</p>
          )}

          <ActionForm action={uploadArticleImageAction} className="flex flex-wrap items-center gap-2 pt-2">
            <input type="hidden" name="article_id" value={article.id} />
            <input
              type="file"
              name="file"
              required
              accept=".png,.jpg,.jpeg,.webp,.pdf"
              className="rounded border px-2 py-1 text-sm"
            />
            <button className="rounded bg-black px-3 py-1.5 text-sm text-white">
              Додати файл ілюстрації
            </button>
          </ActionForm>
        </section>

        <div className="border-t pt-4">
          <ActionForm action={returnToDraftAction}>
            <input type="hidden" name="articleId" value={article.id} />
            <button className="rounded border px-3 py-1.5 text-sm">
              Повернути в чернетки (Ф3)
            </button>
          </ActionForm>
        </div>
      </article>

      <section className="space-y-3 rounded border bg-gray-50 p-5">
        <h2 className="text-lg font-semibold">Поскаржитися на статтю (Ф7)</h2>
        <ActionForm action={submitComplaintAction} className="space-y-3">
          <input type="hidden" name="articleId" value={article.id} />
          <textarea
            name="reason"
            required
            rows={3}
            placeholder="Опишіть порушення канону або причину скарги (від 5 символів)..."
            className="w-full rounded border bg-white p-2 text-sm"
          />
          <button className="rounded bg-black px-4 py-1.5 text-sm text-white">
            Надіслати скаргу
          </button>
        </ActionForm>
      </section>
    </main>
  );
}
