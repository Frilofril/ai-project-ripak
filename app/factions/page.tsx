import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { listFactions } from "@/lib/data/factions";
import { db } from "@/lib/data/db/client";
import { signOutAction } from "@/app/login/actions";
import { createFactionAction, deleteFactionAction } from "./actions";

export default async function FactionsPage() {
  const supabase = db();
  const [factions, { data: authData }] = await Promise.all([
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

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold">Довідник фракцій світу (Ф5)</h1>
          <p className="text-sm text-gray-600">Держави, ордени та спільноти вигаданого всесвіту</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className="underline">
            ← Назад до каталогу
          </Link>
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
          ) : null}
        </div>
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
                  Пов&apos;язані статті →
                </Link>
                {isEditor ? (
                  <ActionForm action={deleteFactionAction}>
                    <input type="hidden" name="factionId" value={faction.id} />
                    <button className="rounded border border-red-600 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50">
                      Видалити
                    </button>
                  </ActionForm>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}

      {isEditor ? (
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
      ) : null}
    </main>
  );
}