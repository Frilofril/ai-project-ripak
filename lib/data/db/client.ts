// Підключення до бази Supabase (практична робота 5). Не змінюйте цей файл.
// На сервері клієнт діє від імені користувача, який увійшов: сеанс береться з cookies запиту.
// Клієнт створюється заново на кожен виклик: спільний клієнт передав би сеанс одного користувача іншому.
// У тестах (npm test) клієнта задає tests/helpers/users.ts: від імені тестового акаунта А або Б.
// Службовий ключ (SUPABASE_SERVICE_ROLE_KEY) тут не використовується.

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { faultFetch } from "./fault-mode";

let testClient: SupabaseClient | undefined;

export function setTestClient(client: SupabaseClient): void {
  testClient = client;
}

export function supabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Немає NEXT_PUBLIC_SUPABASE_URL або NEXT_PUBLIC_SUPABASE_ANON_KEY: перевірте файл .env.local",
    );
  }
  return { url: url.trim().replace(/\/+$/, ""), key: key.trim() };
}

export function db(): SupabaseClient {
  if (process.env.VITEST) {
    if (!testClient) {
      throw new Error("Тест не увійшов: перевірте tests/setup.ts і змінні TEST_USER_… у .env.local");
    }
    return testClient;
  }
  const { url, key } = supabaseEnv();
  // cookies() викликається одразу: так Next.js знає, що сторінка з даними рендериться на кожен запит.
  const cookieStore = cookies();
  return createServerClient(url, key, {
    cookies: {
      async getAll() {
        return (await cookieStore).getAll();
      },
      async setAll(cookiesToSet) {
        try {
          const store = await cookieStore;
          for (const { name, value, options } of cookiesToSet) store.set(name, value, options);
        } catch {
          // Сторінка не може змінювати cookies; сеанс оновлює proxy.ts.
        }
      },
    },
    global: { fetch: faultFetch },
  });
}
