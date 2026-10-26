export type ArticleCategory = "персонаж" | "локація" | "подія";
export type ArticleStatus = "чернетка" | "на перевірці" | "опубліковано";

export type Article = {
  id: string;
  title: string;
  category: ArticleCategory;
  content: string;
  imageUrl: string;
  status: ArticleStatus;
  authorName: string;
  factionIds: string[];
};

// ЗАГЛУШКА: реалізація на кроці 13
export async function listPublishedArticles(_filter?: {
  category?: string;
  factionId?: string;
  query?: string;
}): Promise<Article[]> {
  return [];
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function getArticle(_id: string): Promise<Article | null> {
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
    imageUrl: "",
    status: "чернетка",
    authorName: input.authorName ?? "Співавтор",
    factionIds: input.factionIds,
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function updateArticleStatus(
  _articleId: string,
  status: ArticleStatus
): Promise<Article> {
  return {
    id: "",
    title: "",
    category: "подія",
    content: "",
    imageUrl: "",
    status,
    authorName: "Співавтор",
    factionIds: [],
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function attachArticleImage(
  _articleId: string,
  _fileName: string,
  _fileSizeMb: number
): Promise<Article> {
  return {
    id: "",
    title: "",
    category: "локація",
    content: "",
    imageUrl: "",
    status: "чернетка",
    authorName: "Співавтор",
    factionIds: [],
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function listModerationQueue(): Promise<Article[]> {
  return [];
}
