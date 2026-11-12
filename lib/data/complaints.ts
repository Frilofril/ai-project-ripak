// Модуль даних скарг (ПР 5): екрани отримують скарги з бази через функції lib/data/db/.
export type ComplaintStatus = "відкрита" | "вирішено" | "відхилено";

export type Complaint = {
  id: string;
  articleId: string;
  articleTitle?: string;
  reason: string;
  status: ComplaintStatus;
  authorName?: string;
  reporterName?: string;
};

export {
  listComplaints,
  submitComplaint,
  resolveComplaint,
} from "./db/complaints";