// Сторінка входу й реєстрації (ПР 5): оновлений сучасний дизайн для теми «Спільна вікі вигаданого світу».
import { ActionForm } from "@/components/action-form";
import { db } from "@/lib/data/db/client";
import { signInAction, signOutAction, signUpAction } from "./actions";
import Link from "next/link";

const inputStyle =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm";

const buttonPrimary =
  "w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] disabled:opacity-50";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/" } = await searchParams;
  const { data } = await db().auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
        >
          ← Повернутися до каталогу
        </Link>
        <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 text-2xl font-black">
          W
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
          Спільна вікі вигаданого світу
        </h1>
        <p className="text-sm text-gray-500">
          Авторизація та керування обліковим записом
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        {data.user ? (
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                    Сеанс активний
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  Ви увійшли як: <strong className="text-gray-900 font-semibold">{data.user.email}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="rounded-xl bg-white border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
                >
                  До каталогу →
                </Link>
                <form action={signOutAction}>
                  <button className="rounded-xl bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition shadow-sm">
                    Вийти
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Картка Входу */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>🔑</span> Вхід
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Для авторів і редакторів вікі
                </p>
              </div>

              <ActionForm action={signInAction} className="space-y-3.5">
                <input type="hidden" name="next" value={next} />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Електронна пошта</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="author@universe.local"
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Пароль</label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className={inputStyle}
                  />
                </div>
                <div className="pt-2">
                  <button className={buttonPrimary}>Увійти в акаунт</button>
                </div>
              </ActionForm>
            </div>
          </div>

          {/* Картка Реєстрації */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-indigo-100 bg-gradient-to-b from-indigo-50/20 to-white hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>✨</span> Реєстрація
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Створіть профіль співавтора
                </p>
              </div>

              <ActionForm action={signUpAction} className="space-y-3.5">
                <input type="hidden" name="next" value={next} />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Ім'я та прізвище</label>
                  <input
                    name="full_name"
                    required
                    placeholder="Ренат Ріпак"
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Пошта</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="student@universe.local"
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Пароль</label>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Щонайменше 6 символів"
                    className={inputStyle}
                  />
                </div>
                <div className="pt-2">
                  <button className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-black active:scale-[0.99]">
                    Зареєструватися
                  </button>
                </div>
              </ActionForm>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          Практична робота 5 • Тема 15 «Спільна вікі вигаданого світу»
        </div>
      </div>
    </div>
  );
}