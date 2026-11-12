import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { db } from "@/lib/data/db/client";
import { listFactions } from "@/lib/data/factions";
import { signOutAction } from "@/app/login/actions";
import {
  deleteArticleAction,
  saveDraftAction,
  sendToReviewAction,
} from "./actions";

export default async function EditorPage() {
  const supabase = db();
  const [{ data: userData }, factions, { data: myArticles }] = await Promise.all([
    supabase.auth.getUser(),
    listFactions(),
    supabase
      .from("articles")
      .select("id, title, category, status")
      .in("status", ["чернетка", "на перевірці"])
      .order("title", { ascending: true }),
  ]);

  const drafts = myArticles ?? [];

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 text-sm">
        <Link href="/" className="text-indigo-600 font-medium hover:underline">
          ← Повернутися до каталогу
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/factions" className="text-slate-700 hover:underline">
            Фракції
          </Link>
          <Link href="/moderation" className="text-slate-700 hover:underline">
            Модерація
          </Link>
          {userData.user ? (
            <div className="flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-1">
              <span className="text-xs text-slate-600">{userData.user.email}</span>
              <form action={signOutAction}>
                <button className="text-xs font-medium text-red-600 hover:underline">
                  Вийти
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="rounded bg-black px-3 py-1 text-white">
              Увійти
            </Link>
          )}
        </div>
      </header>

      <section className="p-6 border rounded-xl bg-white space-y-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">
            Редактор чернетки статті (Ф3, Ф4, Ф5)
          </h1>
          <p className="text-sm text-slate-600">
            Створіть новий матеріал і збережіть як чернетку або одразу надішліть на перевірку
          </p>
        </div>

        <ActionForm action={saveDraftAction} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Заголовок статті (Ф3)</label>
            <input
              name="title"
              placeholder="Наприклад: Вежа Зоряного Шпилю"
              required
              minLength={3}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Категорія матеріалу</label>
            <select
              name="category"
              defaultValue="локація"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="локація">Локація</option>
              <option value="персонаж">Персонаж</option>
              <option value="подія">Подія</option>
              <option value="артефакт">Артефакт</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Прив&apos;язка до фракцій (Ф5)</label>
            {factions.length === 0 ? (
              <div className="p-4 border rounded-lg bg-amber-50 text-amber-900 text-sm space-y-1">
                <p>Для вибору прив&apos;язки ще не створено жодної фракції у довіднику</p>
                <Link href="/factions" className="underline text-indigo-700 block">
                  Перейти до довідника фракцій
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {factions.map((fac) => (
                  <label
                    key={fac.id}
                    className="flex items-center gap-2 p-3 border rounded-lg text-sm cursor-pointer hover:bg-slate-50"
                  >
                    <input type="checkbox" name="factionIds" value={fac.id} />
                    <span>{fac.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Текст опису (від 10 символів)</label>
            <textarea
              name="content"
              placeholder="Детальний опис персонажа, локації, події чи артефакту..."
              required
              minLength={10}
              rows={4}
              className="w-full border rounded-lg p-3 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              name="status"
              value="чернетка"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Зберегти чернетку (Ф3.1)
            </button>
            <button
              type="submit"
              name="status"
              value="на перевірці"
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800"
            >
              Надіслати на перевірку Головному редактору (Ф3.2)
            </button>
          </div>
        </ActionForm>
      </section>

      <section className="p-6 border rounded-xl bg-white space-y-4 shadow-sm">
        <h2 className="text-lg font-bold">Ваші чернетки та статті на перевірці</h2>
        {drafts.length === 0 ? (
          <p className="text-sm text-slate-500">
            У вас поки немає активних чернеток. Створіть першу вище!
          </p>
        ) : (
          <div className="divide-y">
            {drafts.map((art) => (
              <div
                key={art.id}
                className="py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <Link
                    href={`/articles/${art.id}`}
                    className="font-medium text-indigo-700 hover:underline"
                  >
                    {art.title}
                  </Link>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Категорія: {art.category} • Статус:{" "}
                    <span className="font-semibold text-slate-700">{art.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {art.status === "чернетка" ? (
                    <ActionForm action={sendToReviewAction}>
                      <input type="hidden" name="articleId" value={art.id} />
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                      >
                        Надіслати на перевірку
                      </button>
                    </ActionForm>
                  ) : null}
                  <ActionForm action={deleteArticleAction}>
                    <input type="hidden" name="id" value={art.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Видалити
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