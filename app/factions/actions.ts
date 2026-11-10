"use server";

import { revalidatePath } from "next/cache";
import { isAccessDenied, type ActionResult } from "@/lib/action-result";
import { currentUserId } from "@/lib/auth";
import { createFaction, deleteFaction } from "@/lib/data/db/factions";
import { checkFaction, checkFactionId } from "@/lib/validation/factions";

// Т9: POST /factions — створити нову фракцію. Коди: 201, 400, 401, 403.
export async function createFactionAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб створити фракцію." };
  }

  const checked = checkFaction(formData);
  if (!checked.ok) {
    return {
      status: 400,
      message: "Перевірте поля форми фракції.",
      fieldErrors: checked.fieldErrors,
    };
  }

  try {
    const faction = await createFaction(checked.value);
    revalidatePath("/factions");
    revalidatePath("/");
    revalidatePath("/editor");
    return { status: 201, id: faction.id, message: "Фракцію додано до довідника." };
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Створювати фракції може лише головний редактор." };
    }
    throw error;
  }
}

// Т10: POST /factions — видалити фракцію. Коди: 200, 400, 401, 403, 404.
export async function deleteFactionAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб видалити фракцію." };
  }

  const checked = checkFactionId(formData);
  if (!checked.ok) {
    return {
      status: 400,
      message: "Некоректний ідентифікатор фракції.",
      fieldErrors: checked.fieldErrors,
    };
  }

  try {
    const deleted = await deleteFaction(checked.value.factionId);
    if (!deleted) {
      return { status: 404, message: "Фракцію не знайдено або у вас немає права її видалити." };
    }
    revalidatePath("/factions");
    revalidatePath("/");
    revalidatePath("/editor");
    return { status: 200, message: "Фракцію видалено." };
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Видаляти фракції може лише головний редактор." };
    }
    throw error;
  }
}
