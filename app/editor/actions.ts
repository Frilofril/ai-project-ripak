"use server";

import { revalidatePath } from "next/cache";
import { isAccessDenied, type ActionResult } from "@/lib/action-result";
import { currentUserId } from "@/lib/auth";
import {
  type ArticleCategory,
  type ArticleStatus,
  attachArticleImage,
  deleteArticle,
  saveDraftArticle,
  updateArticleStatus,
} from "@/lib/data/articles";

const ALLOWED_CATEGORIES: ArticleCategory[] = [
  "персонаж",
  "локація",
  "подія",
  "артефакт",
];

const ALLOWED_DRAFT_STATUSES: ArticleStatus[] = ["чернетка", "на перевірці"];

export async function saveDraftAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб зберегти чернетку." };
  }

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const title = String(formData.get("title") ?? "").trim();
  const rawCategory = String(formData.get("category") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "чернетка").trim();
  const fileName = String(formData.get("fileName") ?? "").trim();
  const factionIds = formData.getAll("factionIds").map(String).filter(Boolean);

  const fieldErrors: Record<string, string> = {};
  if (title.length < 3 || title.length > 120) {
    fieldErrors.title = "Заголовок має містити від 3 до 120 символів.";
  }
  if (!ALLOWED_CATEGORIES.includes(rawCategory as ArticleCategory)) {
    fieldErrors.category = "Оберіть коректну категорію статті.";
  }
  if (content.length < 10 || content.length > 10000) {
    fieldErrors.content = "Текст статті має містити від 10 до 10 000 символів.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 400, message: "Перевірте поля статті.", fieldErrors };
  }

  const status: ArticleStatus = ALLOWED_DRAFT_STATUSES.includes(
    rawStatus as ArticleStatus,
  )
    ? (rawStatus as ArticleStatus)
    : "чернетка";

  try {
    const saved = await saveDraftArticle({
      id,
      title,
      category: rawCategory as ArticleCategory,
      content,
      status,
      factionIds,
    });

    if (fileName) {
      await attachArticleImage(saved.id, fileName, 2.0);
    }

    revalidatePath("/editor");
    revalidatePath("/");
    revalidatePath("/moderation");

    return {
      status: id ? 200 : 201,
      id: saved.id,
      message: id ? "Чернетку оновлено." : "Чернетку створено.",
    };
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Немає доступу для зміни цієї статті." };
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return { status: 404, message: "Статтю не знайдено." };
    }
    throw error;
  }
}

export async function deleteArticleAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб видалити статтю." };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { status: 400, message: "Не вказано ідентифікатор статті." };
  }

  try {
    const deleted = await deleteArticle(id);
    if (!deleted) {
      return { status: 404, message: "Статтю не знайдено або немає доступу." };
    }

    revalidatePath("/editor");
    revalidatePath("/");
    revalidatePath("/moderation");

    return { status: 200, message: "Статтю видалено." };
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Немає доступу для видалення цієї статті." };
    }
    throw error;
  }
}

export async function sendToReviewAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб надіслати статтю на перевірку." };
  }

  const articleId = String(formData.get("articleId") ?? "").trim();
  if (!articleId) {
    return { status: 400, message: "Не вказано ідентифікатор статті." };
  }

  try {
    await updateArticleStatus(articleId, "на перевірці");
    revalidatePath("/editor");
    revalidatePath("/moderation");
    return { status: 200, message: "Статтю надіслано на перевірку." };
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Немає доступу до цієї статті." };
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return { status: 404, message: "Статтю не знайдено." };
    }
    throw error;
  }
}