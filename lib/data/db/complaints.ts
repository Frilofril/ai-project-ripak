import { db } from "./client";
import type { Complaint } from "@/lib/data/complaints";

type ComplaintRow = {
  id: string;
  article_id: string;
  reporter_id: string | null;
  reason: string;
  status: "відкрита" | "вирішено" | "відхилено";
  articles?: { title: string } | { title: string }[] | null;
  profiles?: { full_name: string } | { full_name: string }[] | null;
};

function toComplaint(row: ComplaintRow): Complaint {
  const art = Array.isArray(row.articles) ? row.articles[0] : row.articles;
  const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    articleId: row.article_id,
    articleTitle: art?.title ?? "Стаття всесвіту",
    reason: row.reason,
    status: row.status,
    authorName: prof?.full_name ?? "Читач вікі",
  };
}

const SELECT_COMPLAINT =
  "id, article_id, reporter_id, reason, status, articles(title), profiles(full_name)";

export async function listComplaints(onlyOpen = true): Promise<Complaint[]> {
  let req = db().from("complaints").select(SELECT_COMPLAINT);
  if (onlyOpen) {
    req = req.eq("status", "відкрита");
  }
  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as ComplaintRow[]).map(toComplaint);
}

export async function submitComplaint(input: {
  articleId: string;
  reason: string;
  authorName?: string;
}): Promise<Complaint> {
  const reason = input.reason.trim();
  const { data, error } = await db()
    .from("complaints")
    .insert({
      article_id: input.articleId,
      reason,
      status: "відкрита",
    })
    .select(SELECT_COMPLAINT)
    .single();

  if (error) throw new Error(error.message);
  return toComplaint(data as unknown as ComplaintRow);
}

export async function resolveComplaint(
  complaintId: string,
  decision: "вирішено" | "відхилено",
): Promise<Complaint> {
  const { data: updated, error } = await db()
    .from("complaints")
    .update({ status: decision })
    .eq("id", complaintId)
    .select(SELECT_COMPLAINT)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!updated) throw new Error("NOT_FOUND");

  const row = updated as unknown as ComplaintRow;

  if (decision === "вирішено") {
    const { error: artErr } = await db()
      .from("articles")
      .update({ status: "чернетка" })
      .eq("id", row.article_id);
    if (artErr) throw new Error(artErr.message);

    const { error: closeOthersErr } = await db()
      .from("complaints")
      .update({ status: "вирішено" })
      .eq("article_id", row.article_id)
      .eq("status", "відкрита");
    if (closeOthersErr) throw new Error(closeOthersErr.message);
  }

  return toComplaint(row);
}
