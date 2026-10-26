"use client";

import Link from "next/link";

export default function FactionsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-red-700">Довідник фракцій світу (Ф5)</h1>
      <div className="p-6 border border-red-300 rounded-xl bg-red-50 space-y-3">
        <p className="font-medium text-red-800">
          Не вдалося завантажити довідник фракцій
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm"
          >
            Спробувати ще раз
          </button>
          <Link href="/" className="px-4 py-2 border bg-white rounded-lg text-sm">
            ← Назад до каталогу
          </Link>
        </div>
      </div>
    </main>
  );
}
