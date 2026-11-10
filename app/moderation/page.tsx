import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { listModerationQueue } from "@/lib/data/articles";
import { listComplaints } from "@/lib/data/complaints";
import { moderateArticleAction, resolveComplaintAction } from "./actions";

export default async function ModerationPage() {
  const [queue, complaints] = await Promise.all([
    listModerationQueue(),
    listComplaints(true),
  ]);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex items-center justify-between border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold">Панель модерації (Ф6, Ф7)</h1>
          <p className="text-sm text-gray-600">Перевірка статей та розгляд відкритих скарг користувачів</p>
        </div>
        <Link href="/" className="text-sm underline">
          ← Повернутися до каталогу
        </Link>
      </header>

      {queue.length === 0 && complaints.length === 0 ? (
        <section className="rounded border border-amber-300 bg-amber-50 p-6 text-center">
          <p className="font-medium text-amber-900">
            Черга матеріалів на перевірці та список відкритих скарг порожні — усі звернення опрацьовано
          </p>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Черга матеріалів на перевірці (Ф6)</h2>
        {queue.length === 0 ? (
          <p className="text-sm text-gray-500">Немає статей у статусі «на перевірці».</p>
        ) : (
          <div className="space-y-3">
            {queue.map((art) => (
              <div key={art.id} className="flex flex-wrap items-center justify-between gap-3 rounded border bg-white p-4">
                <div>
                  <p className="font-semibold">{art.title}</p>
                  <p className="text-xs text-gray-500">
                    Категорія: {art.category} · Автор: {art.authorName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ActionForm action={moderateArticleAction}>
                    <input type="hidden" name="articleId" value={art.id} />
                    <input type="hidden" name="decision" value="опубліковано" />
                    <button className="rounded bg-black px-3 py-1 text-xs text-white">
                      Опублікувати
                    </button>
                  </ActionForm>
                  <ActionForm action={moderateArticleAction}>
                    <input type="hidden" name="articleId" value={art.id} />
                    <input type="hidden" name="decision" value="чернетка" />
                    <button className="rounded border px-3 py-1 text-xs">
                      Повернути в чернетки
                    </button>
                  </ActionForm>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Відкриті скарги користувачів (Ф7)</h2>
        {complaints.length === 0 ? (
          <p className="text-sm text-gray-500">Відкритих скарг немає.</p>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded border bg-white p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Стаття: {c.articleTitle}</p>
                  <p className="text-sm text-gray-700">Причина: {c.reason}</p>
                  <p className="text-xs text-gray-500">Автор звернення: {c.authorName}</p>
                </div>
                <div className="flex gap-2">
                  <ActionForm action={resolveComplaintAction}>
                    <input type="hidden" name="complaintId" value={c.id} />
                    <input type="hidden" name="decision" value="вирішено" />
                    <button className="rounded bg-black px-3 py-1 text-xs text-white">
                      Прийняти (зняти в чернетки)
                    </button>
                  </ActionForm>
                  <ActionForm action={resolveComplaintAction}>
                    <input type="hidden" name="complaintId" value={c.id} />
                    <input type="hidden" name="decision" value="відхилено" />
                    <button className="rounded border px-3 py-1 text-xs">
                      Відхилити
                    </button>
                  </ActionForm>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
