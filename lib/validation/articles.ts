// Серверна валідація форм для статей вікі (практична робота 5).
import type { ArticleCategory, ArticleStatus } from "@/lib/data/articles";

export type Checked<T> =
  | { ok: true; value: T }
  | { ok: false; fieldErrors: Record<string, string> };

const ALLOWED_CATEGORIES: ArticleCategory[] = ["персонаж", "локація", "подія", "артефакт"];
const ALLOWED_DRAFT_STATUSES: ArticleStatus[] = ["чернетка", "на перевірці"];
const ALLOWED_MODERATION_DECISIONS: ArticleStatus[] = ["опубліковано", "чернетка"];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

export type DraftArticleInput = {
  id?: string;
  title: string;
  category: ArticleCategory;
  content: string;
  status: ArticleStatus;
  factionIds: string[];
};

export function checkDraftArticle(formData: FormData): Checked<DraftArticleInput> {
  const rawId = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() as ArticleCategory;
  const content = String(formData.get("content") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "чернетка").trim() as ArticleStatus;
  const rawFactions = formData.getAll("factionIds").map((v) => String(v).trim()).filter(Boolean);

  const fieldErrors: Record<string, string> = {};

  if (rawId && !isValidUuid(rawId)) {
    fieldErrors.id = "Некоректний ідентифікатор статті.";
  }

  if (!title) {
    fieldErrors.title = "Заголовок статті обов'язковий (від 3 до 120 символів).";
  } else if (title.length < 3 || title.length > 120) {
    fieldErrors.title = "Заголовок має містити від 3 до 120 символів.";
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    fieldErrors.category = "Оберіть допустиму категорію: персонаж, локація, подія або артефакт.";
  }

  if (!content) {
    fieldErrors.content = "Текст опису статті обов'язковий (від 10 до 10000 символів).";
  } else if (content.length < 10 || content.length > 10000) {
    fieldErrors.content = "Текст опису має містити від 10 до 10000 символів.";
  }

  const status: ArticleStatus = ALLOWED_DRAFT_STATUSES.includes(rawStatus) ? rawStatus : "чернетка";

  if (rawFactions.some((fid) => !isValidUuid(fid))) {
    fieldErrors.factionIds = "Некоректний ідентифікатор обраної фракції.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    value: {
      id: rawId || undefined,
      title,
      category,
      content,
      status,
      factionIds: rawFactions,
    },
  };
}

export function checkModerationArticle(
  formData: FormData,
): Checked<{ articleId: string; decision: ArticleStatus }> {
  const articleId = String(formData.get("articleId") ?? formData.get("id") ?? "").trim();
  const decision = String(formData.get("decision") ?? formData.get("status") ?? "").trim() as ArticleStatus;
  const fieldErrors: Record<string, string> = {};

  if (!isValidUuid(articleId)) {
    fieldErrors.articleId = "Некоректний ідентифікатор статті.";
  }
  if (!ALLOWED_MODERATION_DECISIONS.includes(decision)) {
    fieldErrors.decision = "Рішення модерації має бути «опубліковано» або «чернетка».";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, value: { articleId, decision } };
}
