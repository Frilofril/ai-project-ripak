import type { Article, ArticleCategory, ArticleStatus } from "@/lib/data/articles";
import { db } from "./client";

type ArticleRow = {
  id: string;
  title: string;
  category: ArticleCategory;
  content: string;
  status: ArticleStatus;
  image_url: string | null;
  author_id: string | null;
  profiles?: { full_name: string } | { full_name: string }[] | null;
  article_factions?: { faction_id: string }[] | null;
};

function toArticle(row: ArticleRow): Article {
  const profileObj = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const factionIds = (row.article_factions ?? []).map((af) => af.faction_id);
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    status: row.status,
    authorName: profileObj?.full_name ?? "Співавтор",
    factionIds,
    ...(row.image_url ? { imageUrl: row.image_url } : {}),
  };
}

async function resolveAuthorId(authorName?: string): Promise<string | null> {
  const clean = (authorName ?? "Співавтор").trim();
  if (!clean) return null;
  const { data: existing, error: findErr } = await db()
    .from("profiles")
    .select("id")
    .eq("full_name", clean)
    .maybeSingle();
  if (findErr) throw new Error(findErr.message);
  if (existing?.id) return existing.id as string;

  const { data: created, error: createErr } = await db()
    .from("profiles")
    .insert({ full_name: clean, role: "співавтор" })
    .select("id")
    .single();
  if (createErr) throw new Error(createErr.message);
  return created.id as string;
}

export async function listPublishedArticles(filter?: {
  category?: string;
  factionId?: string;
  query?: string;
}): Promise<Article[]> {
  let req = db()
    .from("articles")
    .select("id, title, category, content, status, image_url, author_id, profiles(full_name), article_factions(faction_id)")
    .eq("status", "опубліковано");

  if (filter?.category && filter.category !== "усі") {
    req = req.eq("category", filter.category);
  }
  if (filter?.query && filter.query.trim().length > 0) {
    const q = filter.query.trim();
    req = req.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
  }

  const { data, error } = await req;
  if (error) throw new Error(error.message);

  const items = ((data ?? []) as unknown as ArticleRow[]).map(toArticle);
  if (filter?.factionId && filter.factionId !== "усі") {
    return items.filter((a) => a.factionIds.includes(filter.factionId!));
  }
  return items;
}

export async function getArticle(id: string): Promise<Article | null> {
  if (!id || !id.trim()) return null;
  const { data, error } = await db()
    .from("articles")
    .select("id, title, category, content, status, image_url, author_id, profiles(full_name), article_factions(faction_id)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toArticle(data as unknown as ArticleRow) : null;
}

export async function saveDraftArticle(input: {
  id?: string;
  title: string;
  category: ArticleCategory;
  content: string;
  factionIds: string[];
  authorName?: string;
}): Promise<Article> {
  const authorId = await resolveAuthorId(input.authorName);

  let articleId = input.id;
  if (articleId) {
    const { error: updErr } = await db()
      .from("articles")
      .update({
        title: input.title,
        category: input.category,
        content: input.content,
        status: "чернетка",
        author_id: authorId,
      })
      .eq("id", articleId);
    if (updErr) throw new Error(updErr.message);
  } else {
    const { data: inserted, error: insErr } = await db()
      .from("articles")
      .insert({
        title: input.title,
        category: input.category,
        content: input.content,
        status: "чернетка",
        author_id: authorId,
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);
    articleId = inserted.id as string;
  }

  const { error: delLinksErr } = await db()
    .from("article_factions")
    .delete()
    .eq("article_id", articleId);
  if (delLinksErr) throw new Error(delLinksErr.message);

  if (input.factionIds.length > 0) {
    const links = input.factionIds.map((factionId) => ({
      article_id: articleId!,
      faction_id: factionId,
    }));
    const { error: insLinksErr } = await db().from("article_factions").insert(links);
    if (insLinksErr) throw new Error(insLinksErr.message);
  }

  const saved = await getArticle(articleId!);
  if (!saved) throw new Error("Не вдалося прочитати збережену статтю");
  return saved;
}

export async function updateArticleStatus(
  articleId: string,
  status: ArticleStatus,
): Promise<Article> {
  const { error } = await db()
    .from("articles")
    .update({ status })
    .eq("id", articleId);
  if (error) throw new Error(error.message);

  const updated = await getArticle(articleId);
  if (!updated) throw new Error("Статтю не знайдено");
  return updated;
}

export async function attachArticleImage(
  articleId: string,
  fileName: string,
  fileSizeMb: number,
): Promise<Article> {
  if (!fileName.trim()) {
    throw new Error("Назва файлу ілюстрації не може бути порожньою");
  }
  if (fileSizeMb <= 0 || fileSizeMb > 5) {
    throw new Error("Розмір файлу має бути в межах до 5 МБ");
  }
  const imageUrl = `storage://wiki-media/${fileName.trim()}`;
  const { error } = await db()
    .from("articles")
    .update({ image_url: imageUrl })
    .eq("id", articleId);
  if (error) throw new Error(error.message);

  const updated = await getArticle(articleId);
  if (!updated) throw new Error("Статтю не знайдено");
  return updated;
}

export async function listModerationQueue(): Promise<Article[]> {
  const { data, error } = await db()
    .from("articles")
    .select("id, title, category, content, status, image_url, author_id, profiles(full_name), article_factions(faction_id)")
    .eq("status", "на перевірці");
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as ArticleRow[]).map(toArticle);
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await db().from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
