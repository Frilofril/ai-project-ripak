// Вхід тестових акаунтів А і Б (практична робота 5). Не змінюйте цей файл.
// Пошта й пароль — у .env.local: TEST_USER_A_EMAIL, TEST_USER_B_EMAIL, TEST_USER_PASSWORD.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { setTestClient, supabaseEnv } from "@/lib/data/db/client";

const signedIn: Partial<Record<"A" | "B", SupabaseClient>> = {};

// Після виклику всі функції lib/data/db/ і серверні дії працюють від імені цього акаунта.
export async function signInAs(who: "A" | "B"): Promise<SupabaseClient> {
  let client = signedIn[who];
  if (!client) {
    const email = who === "A" ? process.env.TEST_USER_A_EMAIL : process.env.TEST_USER_B_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    if (!email || !password) {
      throw new Error(`Немає TEST_USER_${who}_EMAIL або TEST_USER_PASSWORD у .env.local`);
    }
    const { url, key } = supabaseEnv();
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`Акаунт ${who} не входить: ${error.message}`);
    signedIn[who] = client;
  }
  setTestClient(client);
  return client;
}
