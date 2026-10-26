"use server";

import { revalidatePath } from "next/cache";
import {
  ArticleCategory,
  attachArticleImage,
  saveDraftArticle,
  updateArticleStatus,
} from "@/lib/data/articles";

export async function saveDraftAction(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const category = String(formData.get("category") ?? "локація") as ArticleCategory;
  const content = String(formData.get("content") ?? "");
  const fileName = String(formData.get("fileName") ?? "").trim();
  const factionIds = formData.getAll("factionIds").map(String);

  const saved = await saveDraftArticle({
    title,
    category,
    content,
    factionIds,
  });

  if (fileName) {
    await attachArticleImage(saved.id, fileName, 2.0);
  }

  revalidatePath("/editor");
  revalidatePath("/");
}

export async function sendToReviewAction(formData: FormData) {
  const articleId = String(formData.get("articleId") ?? "5");
  await updateArticleStatus(articleId, "на перевірці");
  revalidatePath("/editor");
  revalidatePath("/moderation");
}
