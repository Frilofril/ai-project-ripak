import { withMockMode } from "@/lib/data/mock-mode";
import { getRawArticlesInternal, updateArticleStatus } from "@/lib/data/articles";

export type ComplaintStatus = "відкрита" | "вирішено" | "відхилено";

export type Complaint = {
  id: string;
  articleId: string;
  articleTitle: string;
  authorName: string;
  reason: string;
  status: ComplaintStatus;
};

const complaintsStore: Complaint[] = [
  {
    id: "comp-1",
    articleId: "1",
    articleTitle: "Хроніки Першої Епохи",
    authorName: "Співавтор",
    reason: "Неточність у назві гірського перевалу",
    status: "відкрита",
  },
];

export async function listComplaints(onlyOpen = true): Promise<Complaint[]> {
  const items = await withMockMode(complaintsStore);
  const filtered = onlyOpen
    ? items.filter((c) => c.status === "відкрита")
    : items;
  return filtered.map((c) => ({ ...c }));
}

export async function submitComplaint(input: {
  articleId: string;
  reason: string;
  authorName?: string;
}): Promise<Complaint> {
  const reason = input.reason?.trim();
  const articleId = input.articleId?.trim();
  if (!articleId || !reason) {
    throw new Error("Вкажіть статтю та причину скарги");
  }

  const article = getRawArticlesInternal().find((a) => a.id === articleId);
  const created: Complaint = {
    id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    articleId,
    articleTitle: article?.title ?? `Стаття #${articleId}`,
    authorName: input.authorName?.trim() || "Співавтор",
    reason,
    status: "відкрита",
  };

  complaintsStore.unshift(created);
  return { ...created };
}

export async function resolveComplaint(
  complaintId: string,
  decision: "вирішено" | "відхилено"
): Promise<Complaint> {
  const target = complaintsStore.find((c) => c.id === complaintId);
  if (!target) {
    throw new Error("Скаргу не знайдено");
  }

  target.status = decision;

  if (decision === "вирішено") {
    await updateArticleStatus(target.articleId, "чернетка");
    for (const c of complaintsStore) {
      if (c.articleId === target.articleId && c.status === "відкрита") {
        c.status = "вирішено";
      }
    }
  }

  return { ...target };
}
