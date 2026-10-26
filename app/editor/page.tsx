import Link from "next/link";
import { listFactions } from "@/lib/data/factions";
import { saveDraftAction, sendToReviewAction } from "./actions";

export default async function EditorPage() {
  const factions = await listFactions();

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between border-b pb-4 text-sm">
        <Link href="/" className="text-indigo-600 font-medium hover:underline">
          ← Повернутися до каталогу
        </Link>
        <div className="flex gap-4">
          <Link href="/factions" className="text-slate-700 hover:underline">
            Фракції
          </Link>
          <Link href="/moderation" className="text-slate-700 hover:underline">
            Модерація
          </Link>
        </div>
      </header>

      <section className="p-6 border rounded-xl bg-white space-y-5">
        <div>
          <h1 className="text-2xl font-bold">
            Редактор чернетки статті (Ф3, Ф4, Ф5)
          </h1>
          <p className="text-sm text-slate-600">
            Створіть або оновіть матеріал перед перевіркою
          </p>
        </div>

        <form action={saveDraftAction} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Заголовок статті (Ф3)</label>
            <input
              name="title"
              defaultValue="Літопис Прикордонної Фортеці"
              required
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
                    className="flex items-center gap-2 p-3 border rounded-lg text-sm"
                  >
                    <input
                      type="checkbox"
                      name="factionIds"
                      value={fac.id}
                      defaultChecked={fac.id === "fac-1" || fac.id === "fac-2"}
                    />
                    <span>{fac.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 border border-dashed rounded-xl bg-slate-50 text-center space-y-2">
            <p className="text-sm font-semibold">
              Завантаження файлу у Supabase Storage (Ф4)
            </p>
            <p className="text-xs text-slate-500">
              Формати: PNG, JPG, WEBP до 5 МБ. Файли чернеток захищені від стороннього доступу.
            </p>
            <input
              name="fileName"
              defaultValue="border-fortress-map.webp"
              placeholder="Назва файлу ілюстрації (напр. map.webp)"
              className="border rounded-lg px-3 py-1.5 text-xs bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Текст опису</label>
            <textarea
              name="content"
              defaultValue="Опис споруди, збудованої для захисту караванних шляхів..."
              required
              rows={4}
              className="w-full border rounded-lg p-3 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
            >
              Зберегти чернетку (Ф3.1)
            </button>
          </div>
        </form>

        <form action={sendToReviewAction} className="pt-2 border-t">
          <input type="hidden" name="articleId" value="5" />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium"
          >
            Надіслати на перевірку Головному редактору (Ф3.2)
          </button>
        </form>
      </section>
    </main>
  );
}
