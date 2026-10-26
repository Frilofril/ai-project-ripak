"use client";

import Link from "next/link";

export default function EditorError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-red-700">
        Редактор чернетки статті (Ф3, Ф4, Ф5)
      </h1>
      <div className="p-6 border border-red-300 rounded-xl bg-red-50 space-y-3">
        <p className="font-medium text-red-800">
          Не вдалося завантажити дані редактора чернетки (або редагування заблоковано, бо стаття вже перебуває у статусі &quot;на перевірці&quot;)
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm"
          >
            Спробувати ще раз
          </button>
          <Link href="/" className="px-4 py-2 border bg-white rounded-lg text-sm">
            ← Повернутися до каталогу
          </Link>
        </div>
      </div>
    </main>
  );
}
