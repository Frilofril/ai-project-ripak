// Виклик серверної дії з тесту так, ніби форму надіслано (практична робота 5). Не змінюйте цей файл.
// Це і є запит «повз форму»: перевірки браузера (required, minLength) тут не діють.

import type { ActionResult } from "@/lib/action-result";

export type Submitted = Omit<ActionResult, "status"> & { status: ActionResult["status"] | 0 };

export async function submit(action: unknown, fields: Record<string, string>): Promise<Submitted> {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) formData.set(name, value);
  try {
    const call = action as (previous: null, formData: FormData) => Promise<ActionResult | undefined>;
    const result = await call(null, formData);
    return result ?? { status: 0, message: "Дія нічого не повернула: вона ще не у форматі ПР 5" };
  } catch (error) {
    console.error("Серверна дія завершилася винятком:", error);
    return { status: 0, message: `Виняток: ${error instanceof Error ? error.message : String(error)}` };
  }
}
