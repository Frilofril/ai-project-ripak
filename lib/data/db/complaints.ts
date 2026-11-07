import type { Complaint } from "@/lib/data/complaints";

// ЗАГЛУШКА: реалізація на кроці 13
export async function listComplaints(onlyOpen = true): Promise<Complaint[]> {
  void onlyOpen;
  return [];
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function submitComplaint(input: {
  articleId: string;
  reason: string;
  authorName?: string;
}): Promise<Complaint> {
  return {
    id: "",
    articleId: input.articleId,
    articleTitle: "",
    reason: input.reason,
    authorName: input.authorName ?? "Читач",
    status: "відкрита",
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function resolveComplaint(
  complaintId: string,
  decision: "вирішено" | "відхилено",
): Promise<Complaint> {
  void complaintId;
  return {
    id: "",
    articleId: "",
    articleTitle: "",
    reason: "",
    authorName: "Читач",
    status: decision,
  };
}
