import Link from "next/link";
import { listModerationQueue } from "@/lib/data/articles";
import { listComplaints } from "@/lib/data/complaints";
import { moderateArticleAction, resolveComplaintAction } from "./actions";

export default async function ModerationPage() {
  const [queue, complaints] = await Promise.all([
    listModerationQueue(),
    listComplaints(true),
  ]);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
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

      <div>
        <h1 className="text-2xl font-bold">Панель модерації (Ф6, Ф7)</h1>
        <p className="text-sm text-slate-600">
          Затвердження матеріалів та розгляд звернень
        </p>
      </div>

      {queue.length === 0 && complaints.length === 0 ? (
        <div className="p-6 border rounded-xl bg-amber-50 text-amber-900 space-y-2">
          <p className="font-medium">
            Черга матеріалів на перевірці та список відкритих скарг порожні — усі звернення опрацьовано
          </p>
          <Link href="/" className="underline text-indigo-700 text-sm block">
            Повернутися до каталогу
          </Link>
        </div>
      ) : (
        <>
          <section className="p-6 border rounded-xl bg-white space-y-4">
            <h2 className="font-bold">Черга матеріалів на перевірці (Ф6)</h2>
            {queue.length === 0 ? (
              <p className="text-sm text-slate-500">
                Статей у статусі «на перевірці» наразі немає.
              </p>
            ) : (
              <div className="space-y-3">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.title} (автор: {item.authorName})
                      </p>
                      <p className="text-xs text-slate-500">
                        Категорія: {item.category} · Статус: {item.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form action={moderateArticleAction}>
                        <input type="hidden" name="articleId" value={item.id} />
                        <input
                          type="hidden"
                          name="status"
                          value="опубліковано"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium"
                        >
                          Опублікувати
                        </button>
                      </form>
                      <form action={moderateArticleAction}>
                        <input type="hidden" name="articleId" value={item.id} />
                        <input type="hidden" name="status" value="чернетка" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium"
                        >
                          Повернути в чернетки
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="p-6 border rounded-xl bg-white space-y-4">
            <h2 className="font-bold">Відкриті скарги користувачів (Ф7)</h2>
            {complaints.length === 0 ? (
              <p className="text-sm text-slate-500">
                Відкритих скарг немає.
              </p>
            ) : (
              <div className="space-y-3">
                {complaints.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-4 border rounded-lg flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold">
                        Скарга на статтю #{comp.articleId}: {comp.articleTitle}
                      </p>
                      <p className="text-xs text-slate-500">
                        Причина: {comp.reason} · Статус: {comp.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form action={resolveComplaintAction}>
                        <input
                          type="hidden"
                          name="complaintId"
                          value={comp.id}
                        />
                        <input type="hidden" name="decision" value="вирішено" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium"
                        >
                          Прийняти (зняти в чернетки)
                        </button>
                      </form>
                      <form action={resolveComplaintAction}>
                        <input
                          type="hidden"
                          name="complaintId"
                          value={comp.id}
                        />
                        <input
                          type="hidden"
                          name="decision"
                          value="відхилено"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 border bg-slate-100 rounded-lg text-xs font-medium"
                        >
                          Відхилити
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
