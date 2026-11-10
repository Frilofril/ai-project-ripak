import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { listFactions } from "@/lib/data/factions";
import { createFactionAction, deleteFactionAction } from "./actions";

export default async function FactionsPage() {
  const factions = await listFactions();

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex items-center justify-between border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold">Довідник фракцій світу (Ф5)</h1>
          <p className="text-sm text-gray-600">Держави, ордени та спільноти вигаданого всесвіту</p>
        </div>
        <Link href="/" className="text-sm underline">
          ← Назад до каталогу
        </Link>
      </header>

      {factions.length === 0 ? (
        <section className="rounded border border-amber-300 bg-amber-50 p-6 text-center">
          <p className="font-medium text-amber-900">У довіднику світу ще немає жодної фракції</p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {factions.map((faction) => (
            <article key={faction.id} className="flex flex-col justify-between rounded border bg-white p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="rounded px-2.5 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: faction.colorHex }}
                  >
                    {faction.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    Статей: <strong>{faction.articleCount}</strong>
                  </span>
                </div>
                <p className="text-sm text-gray-700">{faction.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <Link href={`/?factionId=${faction.id}`} className="text-xs underline">
                  Пов'язані статті →
                </Link>
                <ActionForm action={deleteFactionAction}>
                  <input type="hidden" name="factionId" value={faction.id} />
                  <button className="rounded border border-red-600 px-2.5 py-1 text-xs text-red-600">
                    Видалити (Редактор)
                  </button>
                </ActionForm>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="rounded border bg-gray-50 p-5 space-y-3">
        <h2 className="text-lg font-semibold">Додати нову фракцію (Головний редактор)</h2>
        <ActionForm action={createFactionAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              name="name"
              required
              placeholder="Назва фракції"
              className="rounded border bg-white px-3 py-1.5 sm:col-span-2"
            />
            <input
              name="colorHex"
              required
              defaultValue="#2563eb"
              placeholder="#RRGGBB"
              className="rounded border bg-white px-3 py-1.5"
            />
          </div>
          <textarea
            name="description"
            required
            rows={2}
            placeholder="Короткий опис фракції (від 5 символів)..."
            className="w-full rounded border bg-white p-2 text-sm"
          />
          <button className="rounded bg-black px-4 py-1.5 text-sm text-white">
            Створити фракцію
          </button>
        </ActionForm>
      </section>
    </main>
  );
}
