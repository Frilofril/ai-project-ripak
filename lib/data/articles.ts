// Модуль даних статей (ПР 5): екрани отримують статті з бази через функції lib/data/db/.
export type ArticleCategory = "персонаж" | "локація" | "подія" | "артефакт";
export type ArticleStatus = "чернетка" | "на перевірці" | "опубліковано";

export type Article = {
  id: string;
  title: string;
  category: ArticleCategory;
  content: string;
  status: ArticleStatus;
  imageUrl?: string;
  authorName: string;
  authorRole?: "гість" | "співавтор" | "редактор";
  factionIds: string[];
};

export {
  listPublishedArticles,
  getArticle,
  saveDraftArticle,
  updateArticleStatus,
  attachArticleImage,
  listModerationQueue,
  deleteArticle,
} from "./db/articles";