import type { Article, ArticleCategory, ArticleStatus } from "@/lib/data/articles";

// ЗАГЛУШКА: реалізація на кроці 13
export async function listPublishedArticles(filter?: {
  category?: string;
  factionId?: string;
  query?: string;
}): Promise<Article[]> {
  void filter;
  return [];
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function getArticle(id: string): Promise<Article | null> {
  void id;
  return null;
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function saveDraftArticle(input: {
  id?: string;
  title: string;
  category: ArticleCategory;
  content: string;
  factionIds: string[];
  authorName?: string;
}): Promise<Article> {
  return {
    id: "",
    title: input.title,
    category: input.category,
    content: input.content,
    status: "чернетка",
    factionIds: input.factionIds,
    authorName: input.authorName ?? "Співавтор",
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function updateArticleStatus(
  articleId: string,
  status: ArticleStatus,
): Promise<Article> {
  void articleId;
  return {
    id: "",
    title: "",
    category: "локація",
    content: "",
    status,
    factionIds: [],
    authorName: "Співавтор",
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function attachArticleImage(
  articleId: string,
  fileName: string,
  fileSizeMb: number,
): Promise<Article> {
  void articleId;
  void fileSizeMb;
  return {
    id: "",
    title: "",
    category: "локація",
    content: "",
    status: "чернетка",
    factionIds: [],
    authorName: "Співавтор",
    imageUrl: fileName,
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function listModerationQueue(): Promise<Article[]> {
  return [];
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function deleteArticle(id: string): Promise<void> {
  void id;
}
