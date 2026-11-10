import { db } from "./client";
import type { Article, ArticleCategory, ArticleStatus } from "@/lib/data/articles";

type ArticleRow = {
  id: string;
  title: string;
  category: ArticleCategory;
  content: string;
  status: ArticleStatus;
  image_url: string | null;
  author_id: string | null;
  profiles?: { full_name: string; role: string } | { full_name: string; role: string }[] | null;
  article_factions?: { faction_id: string }[] | null;
};

function mapRowToArticle(row: ArticleRow): Article {
  const profileObj = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const factionIds = (row.article_factions ?? []).map((af) => af.faction_id);
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    status: row.status,
    imageUrl: row.image_url ?? undefined,
    authorName: profileObj?.full_name ?? "Співавтор всесвіту",
    authorRole: (profileObj?.role as Article["authorRole"]) ?? "співавтор",
    factionIds,
  };
}

const SELECT_ARTICLE =
  "id, title, category, content, status, image_url, author_id, profiles(full_name, role), article_factions(faction_id)";

export async function listPublishedArticles(filter?: {
  category?: string;
  factionId?: string;
  query?: string;
}): Promise<Article[]> {
  let req = db()
    .from("articles")
    .select(SELECT_ARTICLE)
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

  let articles = ((data ?? []) as unknown as ArticleRow[]).map(mapRowToArticle);
  if (filter?.factionId && filter.factionId !== "усі") {
    articles = articles.filter((a) => a.factionIds.includes(filter.factionId!));
  }
  return articles;
}

export async function getArticle(id: string): Promise<Article | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db()
    .from("articles")
    .select(SELECT_ARTICLE)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRowToArticle(data as unknown as ArticleRow);
}

export async function saveDraftArticle(input: {
  id?: string;
  title: string;
  category: ArticleCategory;
  content: string;
  status?: ArticleStatus;
  factionIds: string[];
  authorName?: string;
}): Promise<Article> {
  const title = input.title.trim();
  const content = input.content.trim();
  if (!title || !content) {
    throw new Error("Заголовок та опис статті не можуть бути порожніми.");
  }

  const status: ArticleStatus = input.status ?? "чернетка";
  let articleId = input.id;

  if (articleId) {
    const { data, error } = await db()
      .from("articles")
      .update({
        title,
        category: input.category,
        content,
        status,
      })
      .eq("id", articleId)
      .select("id")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("NOT_FOUND");
  } else {
    const { data, error } = await db()
      .from("articles")
      .insert({
        title,
        category: input.category,
        content,
        status,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    articleId = data.id as string;
  }

  const { error: delErr } = await db()
    .from("article_factions")
    .delete()
    .eq("article_id", articleId);
  if (delErr) throw new Error(delErr.message);

  if (input.factionIds && input.factionIds.length > 0) {
    const rows = input.factionIds.map((factionId) => ({
      article_id: articleId!,
      faction_id: factionId,
    }));
    const { error: insErr } = await db().from("article_factions").insert(rows);
    if (insErr) throw new Error(insErr.message);
  }

  const loaded = await getArticle(articleId!);
  if (!loaded) throw new Error("Не вдалося прочитати збережену статтю.");
  return loaded;
}

export async function updateArticleStatus(
  articleId: string,
  status: ArticleStatus,
): Promise<Article> {
  const { data, error } = await db()
    .from("articles")
    .update({ status })
    .eq("id", articleId)
    .select(SELECT_ARTICLE)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("NOT_FOUND");
  return mapRowToArticle(data as unknown as ArticleRow);
}

export async function attachArticleImage(
  articleId: string,
  fileName: string,
  fileSizeMb: number,
): Promise<Article> {
  if (fileSizeMb > 5) {
    throw new Error("Файл перевищує допустимий розмір 5 МБ.");
  }
  const imageUrl = fileName.startsWith("storage://")
    ? fileName
    : `storage://wiki-media/${fileName}`;

  const { data, error } = await db()
    .from("articles")
    .update({ image_url: imageUrl })
    .eq("id", articleId)
    .select(SELECT_ARTICLE)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("NOT_FOUND");
  return mapRowToArticle(data as unknown as ArticleRow);
}

export async function listModerationQueue(): Promise<Article[]> {
  const { data, error } = await db()
    .from("articles")
    .select(SELECT_ARTICLE)
    .eq("status", "на перевірці");

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as ArticleRow[]).map(mapRowToArticle);
}

export async function deleteArticle(id: string): Promise<boolean> {
  const { data, error } = await db()
    .from("articles")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}
