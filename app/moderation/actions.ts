"use server";

import { revalidatePath } from "next/cache";
import { updateArticleStatus } from "@/lib/data/articles";
import { resolveComplaint } from "@/lib/data/complaints";

export async function moderateArticleAction(formData: FormData) {
  const articleId = String(formData.get("articleId") ?? "");
  const status = String(formData.get("status") ?? "чернетка") as
    | "опубліковано"
    | "чернетка";
  await updateArticleStatus(articleId, status);
  revalidatePath("/moderation");
  revalidatePath("/");
}

export async function resolveComplaintAction(formData: FormData) {
  const complaintId = String(formData.get("complaintId") ?? "");
  const decision = String(formData.get("decision") ?? "відхилено") as
    | "вирішено"
    | "відхилено";
  await resolveComplaint(complaintId, decision);
  revalidatePath("/moderation");
  revalidatePath("/");
}
