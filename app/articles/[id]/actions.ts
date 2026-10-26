"use server";

import { revalidatePath } from "next/cache";
import { updateArticleStatus } from "@/lib/data/articles";
import { submitComplaint } from "@/lib/data/complaints";

export async function submitComplaintAction(formData: FormData) {
  const articleId = String(formData.get("articleId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  await submitComplaint({ articleId, reason });
  revalidatePath(`/articles/${articleId}`);
  revalidatePath("/moderation");
}

export async function returnToDraftFromViewAction(formData: FormData) {
  const articleId = String(formData.get("articleId") ?? "");
  await updateArticleStatus(articleId, "чернетка");
  revalidatePath(`/articles/${articleId}`);
  revalidatePath("/");
}
