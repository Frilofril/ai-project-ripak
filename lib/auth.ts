// Хто зараз увійшов (практична робота 5). Не змінюйте цей файл.

import { db } from "@/lib/data/db/client";

// id облікового запису входу або null, якщо ніхто не увійшов.
export async function currentUserId(): Promise<string | null> {
  const { data, error } = await db().auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}
