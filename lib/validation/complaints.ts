// Серверна валідація форм для скарг користувачів (практична робота 5).
import { isValidUuid, type Checked } from "./articles";

export type ComplaintInput = {
  articleId: string;
  reason: string;
};

export function checkComplaint(formData: FormData): Checked<ComplaintInput> {
  const articleId = String(formData.get("articleId") ?? formData.get("article_id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const fieldErrors: Record<string, string> = {};

  if (!isValidUuid(articleId)) {
    fieldErrors.articleId = "Некоректний ідентифікатор статті.";
  }

  if (!reason) {
    fieldErrors.reason = "Вкажіть причину скарги (від 5 до 500 символів).";
  } else if (reason.length < 5 || reason.length > 500) {
    fieldErrors.reason = "Причина скарги має містити від 5 до 500 символів.";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, value: { articleId, reason } };
}

export function checkResolveComplaint(
  formData: FormData,
): Checked<{ complaintId: string; decision: "вирішено" | "відхилено" }> {
  const complaintId = String(formData.get("complaintId") ?? formData.get("id") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim() as "вирішено" | "відхилено";
  const fieldErrors: Record<string, string> = {};

  if (!isValidUuid(complaintId)) {
    fieldErrors.complaintId = "Некоректний ідентифікатор скарги.";
  }
  if (decision !== "вирішено" && decision !== "відхилено") {
    fieldErrors.decision = "Рішення щодо скарги має бути «вирішено» або «відхилено».";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, value: { complaintId, decision } };
}
