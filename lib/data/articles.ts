import { withMockMode } from "@/lib/data/mock-mode";

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

const articlesStore: Article[] = [
  {
    id: "1",
    title: "Хроніки Першої Епохи",
    category: "подія",
    content:
      "Стародавній літопис про укладання хартії миру між провінціями. Матеріал упорядковано авторами енциклопедії та затверджено Головним редактором після проходження перевірки.",
    imageUrl: "storage://wiki-media/chronicles-epoch-1.webp",
    status: "опубліковано",
    authorName: "Архіваріус",
    factionIds: ["fac-1", "fac-2"],
  },
  {
    id: "2",
    title: "Цитадель Хранителів",
    category: "локація",
    content:
      "Фортеця у гірському перевалі, де зберігаються історичні рукописи та мапи стародавніх кордонів світу.",
    imageUrl: "storage://wiki-media/citadel-map.png",
    status: "опубліковано",
    authorName: "Картограф",
    factionIds: ["fac-3"],
  },
  {
    id: "3",
    title: "Майстер Елдар",
    category: "персонаж",
    content:
      "Засновник відкритої бібліотеки та дослідник стародавніх ремесел Північних Земель.",
    imageUrl: "storage://wiki-media/master-eldar.jpg",
    status: "опубліковано",
    authorName: "Дослідник",
    factionIds: ["fac-4"],
  },
  {
    id: "4",
    title: "Хроніки Західного Долу",
    category: "локація",
    content:
      "Опис споруди, збудованої для захисту караванних шляхів на кордоні Південного Союзу.",
    imageUrl: "storage://wiki-media/west-vale-draft.webp",
    status: "на перевірці",
    authorName: "Співавтор",
    factionIds: ["fac-2"],
  },
  {
    id: "5",
    title: "Літопис Прикордонної Фортеці",
    category: "локація",
    content:
      "Чорновий опис оборонного валу та сторожових веж між гірськими хребтами.",
    imageUrl: "storage://wiki-media/border-fortress.png",
    status: "чернетка",
    authorName: "Співавтор",
    factionIds: ["fac-1", "fac-2"],
  },
];

export function getRawArticlesInternal(): Article[] {
  return articlesStore;
}

export async function listPublishedArticles(filter?: {
  category?: string;
  factionId?: string;
  query?: string;
}): Promise<Article[]> {
  const items = await withMockMode(articlesStore);
  let result = items.filter((a) => a.status === "опубліковано");

  const cat = filter?.category?.trim();
  if (cat && cat !== "all") {
    result = result.filter((a) => a.category === cat);
  }

  const fac = filter?.factionId?.trim();
  if (fac && fac !== "all") {
    result = result.filter((a) => a.factionIds.includes(fac));
  }

  const q = filter?.query?.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    );
  }

  return result.map((a) => ({ ...a, factionIds: [...a.factionIds] }));
}

export async function getArticle(id: string): Promise<Article | null> {
  const items = await withMockMode(articlesStore);
  const found = items.find((a) => a.id === id);
  return found ? { ...found, factionIds: [...found.factionIds] } : null;
}

export async function saveDraftArticle(input: {
  id?: string;
  title: string;
  category: ArticleCategory;
  content: string;
  factionIds: string[];
  authorName?: string;
}): Promise<Article> {
  const title = input.title?.trim();
  const content = input.content?.trim();

  if (!title || !content) {
    throw new Error("Заголовок та текст опису статті не можуть бути порожніми");
  }

  if (input.id) {
    const existing = articlesStore.find((a) => a.id === input.id);
    if (!existing) {
      throw new Error("Статтю для редагування не знайдено");
    }
    if (existing.status !== "чернетка") {
      throw new Error(
        "Редагування дозволено лише у статусі «чернетка». Спочатку натисніть «Повернути в чернетки»"
      );
    }
    existing.title = title;
    existing.category = input.category;
    existing.content = content;
    existing.factionIds = [...input.factionIds];
    return { ...existing, factionIds: [...existing.factionIds] };
  }

  const created: Article = {
    id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    category: input.category,
    content,
    imageUrl: "",
    status: "чернетка",
    authorName: input.authorName?.trim() || "Співавтор",
    factionIds: [...input.factionIds],
  };

  articlesStore.unshift(created);
  return { ...created, factionIds: [...created.factionIds] };
}

export async function updateArticleStatus(
  articleId: string,
  status: ArticleStatus
): Promise<Article> {
  const article = articlesStore.find((a) => a.id === articleId);
  if (!article) {
    throw new Error("Статтю не знайдено");
  }
  article.status = status;
  return { ...article, factionIds: [...article.factionIds] };
}

export async function attachArticleImage(
  articleId: string,
  fileName: string,
  fileSizeMb: number
): Promise<Article> {
  const cleanName = fileName?.trim();
  if (!cleanName) {
    throw new Error("Вкажіть назву файлу зображення (PNG, JPG, WEBP)");
  }
  if (!Number.isFinite(fileSizeMb) || fileSizeMb <= 0 || fileSizeMb > 5) {
    throw new Error("Розмір файлу має бути до 5 МБ");
  }
  const article = articlesStore.find((a) => a.id === articleId);
  if (!article) {
    throw new Error("Статтю не знайдено");
  }
  article.imageUrl = `storage://wiki-media/${cleanName}`;
  return { ...article, factionIds: [...article.factionIds] };
}

export async function listModerationQueue(): Promise<Article[]> {
  const items = await withMockMode(articlesStore);
  return items
    .filter((a) => a.status === "на перевірці")
    .map((a) => ({ ...a, factionIds: [...a.factionIds] }));
}

export function removeFactionFromAllArticlesInternal(factionId: string): void {
  for (const article of articlesStore) {
    article.factionIds = article.factionIds.filter((id) => id !== factionId);
  }
}
