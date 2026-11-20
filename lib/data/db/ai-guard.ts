// Лічильники викликів, кеш відповідей моделі та запис згенерованої чернетки (тема-15, ПР 6).
import { db } from "./client";
import type { ArticleCategory } from "@/lib/ai/article-draft";

export type AiFactionItem = {
  id: string;
  name: string;
  description: string;
};

export async function countMyCallsSince(since: string): Promise<number> {
  const { count, error } = await db()
    .from("ai_calls")
    .select("id", { count: "exact", head: true })
    .eq("cached", false)
    .gte("created_at", since);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function appCallsToday(): Promise<number> {
  const { data, error } = await db().rpc("ai_app_calls_today");
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

export async function recordCall(cached: boolean): Promise<void> {
  if (process.env.VITEST) return;
  const { error } = await db().from("ai_calls").insert({ cached });
  if (error) throw new Error(error.message);
}

export async function readCache(key: string): Promise<string | null> {
  const { data, error } = await db()
    .from("ai_cache")
    .select("output")
    .eq("key", key)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.output ?? null;
}

export async function writeCache(key: string, output: string, ttlSeconds: number): Promise<void> {
  const expires_at = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const { error } = await db()
    .from("ai_cache")
    .upsert({ key, output, expires_at }, { onConflict: "user_id,key" });
  if (error) throw new Error(error.message);
}

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
  category: ArticleCategory;
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
