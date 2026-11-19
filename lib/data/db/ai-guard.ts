// Допоміжні функції бази для генерації чернетки статті за нотаткою (тема-15, ПР 6, крок 4).
import { db } from "./client";

export type AiFactionItem = {
  id: string;
  name: string;
  description: string;
};

export async function listFactionsForAi(): Promise<AiFactionItem[]> {
  const { data, error } = await db()
    .from("factions")
    .select("id, name, description")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
  }));
}

export async function createAiDraftWithFactions(input: {
  userId: string;
  title: string;
  category: string;
  content: string;
  factionIds: string[];
}): Promise<{ id: string }> {
  const { data: profile, error: profileError } = await db()
    .from("profiles")
    .select("id")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (profileError) throw new Error(profileError.message);

  const insertPayload: Record<string, unknown> = {
    title: input.title,
    category: input.category,
    content: input.content,
    status: "чернетка",
  };
  if (profile?.id) {
    insertPayload.author_id = profile.id;
  }

  const { data: article, error: articleError } = await db()
    .from("articles")
    .insert(insertPayload)
    .select("id")
    .single();
  if (articleError) throw new Error(articleError.message);

  const articleId = String(article.id);
  if (input.factionIds.length > 0) {
    const rows = input.factionIds.map((factionId) => ({
      article_id: articleId,
      faction_id: factionId,
    }));
    const { error: factionsError } = await db().from("article_factions").insert(rows);
    if (factionsError) throw new Error(factionsError.message);
  }

  return { id: articleId };
}

export async function listArticlesByTitle(title: string): Promise<{ id: string; title: string }[]> {
  const { data, error } = await db()
    .from("articles")
    .select("id, title")
    .eq("title", title);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({ id: String(r.id), title: String(r.title) }));
}
