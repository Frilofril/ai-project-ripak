import type { Complaint } from "@/lib/data/complaints";
import { db } from "./client";

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
  const articleObj = Array.isArray(row.articles) ? row.articles[0] : row.articles;
  const profileObj = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    articleId: row.article_id,
    articleTitle: articleObj?.title ?? "",
    reason: row.reason,
    authorName: profileObj?.full_name ?? "Читач",
    status: row.status,
  };
}

export async function listComplaints(onlyOpen = true): Promise<Complaint[]> {
  let req = db()
    .from("complaints")
    .select("id, article_id, reporter_id, reason, status, articles(title), profiles(full_name)");
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
  const cleanName = (input.authorName ?? "Читач").trim() || "Читач";
  let reporterId: string | null = null;
  const { data: existingProfile } = await db()
    .from("profiles")
    .select("id")
    .eq("full_name", cleanName)
    .maybeSingle();

  if (existingProfile?.id) {
    reporterId = existingProfile.id as string;
  } else {
    const { data: createdProfile, error: profErr } = await db()
      .from("profiles")
      .insert({ full_name: cleanName, role: "співавтор" })
      .select("id")
      .single();
    if (profErr) throw new Error(profErr.message);
    reporterId = createdProfile.id as string;
  }

  const { data, error } = await db()
    .from("complaints")
    .insert({
      article_id: input.articleId,
      reporter_id: reporterId,
      reason: input.reason,
      status: "відкрита",
    })
    .select("id, article_id, reporter_id, reason, status, articles(title), profiles(full_name)")
    .single();
  if (error) throw new Error(error.message);
  return toComplaint(data as unknown as ComplaintRow);
}

export async function resolveComplaint(
  complaintId: string,
  decision: "вирішено" | "відхилено",
): Promise<Complaint> {
  const { data: current, error: getErr } = await db()
    .from("complaints")
    .select("id, article_id")
    .eq("id", complaintId)
    .single();
  if (getErr) throw new Error(getErr.message);

  if (decision === "вирішено") {
    const { error: artErr } = await db()
      .from("articles")
      .update({ status: "чернетка" })
      .eq("id", current.article_id);
    if (artErr) throw new Error(artErr.message);

    const { error: allCompErr } = await db()
      .from("complaints")
      .update({ status: "вирішено" })
      .eq("article_id", current.article_id)
      .eq("status", "відкрита");
    if (allCompErr) throw new Error(allCompErr.message);
  } else {
    const { error: oneErr } = await db()
      .from("complaints")
      .update({ status: "відхилено" })
      .eq("id", complaintId);
    if (oneErr) throw new Error(oneErr.message);
  }

  const { data: updated, error: finalErr } = await db()
    .from("complaints")
    .select("id, article_id, reporter_id, reason, status, articles(title), profiles(full_name)")
    .eq("id", complaintId)
    .single();
  if (finalErr) throw new Error(finalErr.message);
  return toComplaint(updated as unknown as ComplaintRow);
}
