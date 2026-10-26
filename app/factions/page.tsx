import Link from "next/link";
import { listFactions } from "@/lib/data/factions";
import { createFactionAction, deleteFactionAction } from "./actions";

export default async function FactionsPage() {
  const factions = await listFactions();

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
          <Link href="/moderation" className="text-slate-700 hover:underline">
            Модерація
          </Link>
        </div>
      </header>

      <div>
        <h1 className="text-2xl font-bold">Довідник фракцій світу (Ф5)</h1>
        <p className="text-sm text-slate-600">
          Організації та союзи, до яких прив&apos;язуються матеріали
        </p>
      </div>

      {factions.length === 0 ? (
        <div className="p-6 border rounded-xl bg-amber-50 text-amber-900">
          У довіднику світу ще немає жодної фракції
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factions.map((fac) => (
            <div
              key={fac.id}
              className="p-5 border rounded-xl bg-white space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: fac.colorHex }}
                    />
                    <h2 className="font-bold">{fac.name}</h2>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                    Статей: {fac.articleCount ?? 0}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{fac.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t text-xs">
                <Link
                  href={`/?faction=${fac.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  Пов&apos;язані статті
                </Link>
                <form action={deleteFactionAction}>
                  <input type="hidden" name="factionId" value={fac.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:underline font-medium"
                  >
                    Видалити (Редактор)
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="p-5 border rounded-xl bg-white space-y-3">
        <h2 className="font-bold text-sm">
          Додати нову фракцію (Головний редактор)
        </h2>
        <form
          action={createFactionAction}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <input
            name="name"
            placeholder="Назва фракції"
            required
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            name="colorHex"
            placeholder="Колір мітки (#3b82f6)"
            defaultValue="#3b82f6"
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            name="description"
            placeholder="Короткий опис"
            required
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
            >
              Створити фракцію
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
