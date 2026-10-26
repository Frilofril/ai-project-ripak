export type ComplaintStatus = "відкрита" | "вирішено" | "відхилено";

export type Complaint = {
  id: string;
  articleId: string;
  articleTitle: string;
  authorName: string;
  reason: string;
  status: ComplaintStatus;
};

// ЗАГЛУШКА: реалізація на кроці 13
export async function listComplaints(_onlyOpen?: boolean): Promise<Complaint[]> {
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
    authorName: input.authorName ?? "Співавтор",
    reason: input.reason,
    status: "відкрита",
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function resolveComplaint(
  _complaintId: string,
  _decision: "вирішено" | "відхилено"
): Promise<Complaint> {
  return {
    id: "",
    articleId: "",
    articleTitle: "",
    authorName: "Співавтор",
    reason: "",
    status: "відкрита",
  };
}
