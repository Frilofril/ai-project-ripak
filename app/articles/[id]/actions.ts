"use server";

import { revalidatePath } from "next/cache";
import { isAccessDenied, type ActionResult } from "@/lib/action-result";
import { currentUserId } from "@/lib/auth";
import { updateArticleStatus } from "@/lib/data/db/articles";
import { submitComplaint } from "@/lib/data/db/complaints";
import { uploadArticleFile } from "@/lib/data/db/article-files";
import { isValidUuid } from "@/lib/validation/articles";
import { checkComplaint } from "@/lib/validation/complaints";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_BYTES = 1024 * 1024;

// Т3: POST /articles/[id] — повернути статтю в чернетки. Коди: 200, 400, 401, 404.
export async function returnToDraftAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб змінити статус статті." };
  }

  const articleId = String(formData.get("articleId") ?? formData.get("id") ?? "").trim();
  if (!isValidUuid(articleId)) {
    return { status: 400, message: "Некоректний ідентифікатор статті.", fieldErrors: { articleId: "Некоректний формат UUID." } };
  }

  try {
    await updateArticleStatus(articleId, "чернетка");
    revalidatePath("/");
    revalidatePath(`/articles/${articleId}`);
    revalidatePath("/moderation");
    return { status: 200, message: "Статтю повернуто у чернетки." };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return { status: 404, message: "Статтю не знайдено або у вас немає права її змінювати." };
    }
    if (isAccessDenied(error)) {
      return { status: 403, message: "Повернути в чернетки можна лише власну статтю." };
    }
    throw error;
  }
}

// Т4: POST /articles/[id] — подати скаргу на опубліковану статтю. Коди: 201, 400, 401, 403, 404.
export async function submitComplaintAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб подати скаргу на статтю." };
  }

  const checked = checkComplaint(formData);
  if (!checked.ok) {
    return {
      status: 400,
      message: "Перевірте поля форми скарги.",
      fieldErrors: checked.fieldErrors,
    };
  }

  try {
    const created = await submitComplaint(checked.value);
    revalidatePath(`/articles/${checked.value.articleId}`);
    revalidatePath("/moderation");
    return { status: 201, id: created.id, message: "Скаргу надіслано головному редактору." };
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Подавати скарги можуть лише авторизовані співавтори та редактори." };
    }
    throw error;
  }
}

// Складна складова (крок 16): POST /articles/[id] — додати ілюстрацію або мапу до статті.
export async function uploadArticleImageAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб додати файл ілюстрації." };
  }

  const articleId = String(formData.get("article_id") ?? formData.get("articleId") ?? "").trim();
  if (!isValidUuid(articleId)) {
    return { status: 400, message: "Некоректний ідентифікатор статті." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: 400, message: "Оберіть файл." };
  }
  if (file.size > MAX_BYTES) {
    return { status: 400, message: "Файл має бути не більше 1 МБ." };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return { status: 400, message: "Дозволено лише PNG, JPEG, WEBP і PDF." };
  }
  if (!/^[\w.-]+$/.test(file.name)) {
    return { status: 400, message: "Назва файлу — латиницею, без пробілів." };
  }

  try {
    await uploadArticleFile(articleId, file);
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Додавати ілюстрації може лише автор цієї статті або редактор." };
    }
    throw error;
  }

  revalidatePath(`/articles/${articleId}`);
  return { status: 201, message: "Ілюстрацію додано." };
}
