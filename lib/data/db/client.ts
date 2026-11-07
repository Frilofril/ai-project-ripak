// Підключення до бази Supabase (практична робота 4). Не змінюйте цей файл.
// Адреса і публічний ключ беруться з .env.local у codespace або зі змінних середовища Vercel.
// Службовий ключ (SUPABASE_SERVICE_ROLE_KEY) тут не використовується.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Немає NEXT_PUBLIC_SUPABASE_URL або NEXT_PUBLIC_SUPABASE_ANON_KEY: перевірте файл .env.local",
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
