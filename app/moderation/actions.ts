"use server";

import { revalidatePath } from "next/cache";
import { isAccessDenied, type ActionResult } from "@/lib/action-result";
import { currentUserId } from "@/lib/auth";
import { updateArticleStatus } from "@/lib/data/db/articles";
import { resolveComplaint } from "@/lib/data/db/complaints";
import { checkModerationArticle } from "@/lib/validation/articles";
import { checkResolveComplaint } from "@/lib/validation/complaints";

// Т12: POST /moderation — опублікувати статтю або повернути в чернетки. Коди: 200, 400, 401, 403, 404.
export async function moderateArticleAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб модерувати статті." };
  }

  const checked = checkModerationArticle(formData);
  if (!checked.ok) {
    return {
      status: 400,
      message: "Перевірте параметри модерації статті.",
      fieldErrors: checked.fieldErrors,
    };
  }

  try {
    await updateArticleStatus(checked.value.articleId, checked.value.decision);
    revalidatePath("/");
    revalidatePath("/moderation");
    revalidatePath(`/articles/${checked.value.articleId}`);
    return { status: 200, message: "Статус статті оновлено." };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return { status: 404, message: "Статтю не знайдено або доступ заборонено." };
    }
    if (isAccessDenied(error)) {
      return { status: 403, message: "Модерувати статті може лише головний редактор." };
    }
    throw error;
  }
}

// Т13: POST /moderation — прийняти або відхилити скаргу. Коди: 200, 400, 401, 403, 404.
export async function resolveComplaintAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб розглядати скарги." };
  }

  const checked = checkResolveComplaint(formData);
  if (!checked.ok) {
    return {
      status: 400,
      message: "Перевірте параметри розгляду скарги.",
      fieldErrors: checked.fieldErrors,
    };
  }

  try {
    await resolveComplaint(checked.value.complaintId, checked.value.decision);
    revalidatePath("/moderation");
    revalidatePath("/");
    return { status: 200, message: "Скаргу опрацьовано." };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return { status: 404, message: "Скаргу не знайдено або у вас немає права її розглядати." };
    }
    if (isAccessDenied(error)) {
      return { status: 403, message: "Розглядати скарги може лише головний редактор." };
    }
    throw error;
  }
}
