import { withMockMode } from "@/lib/data/mock-mode";
import {
  getRawArticlesInternal,
  removeFactionFromAllArticlesInternal,
} from "@/lib/data/articles";

export type Faction = {
  id: string;
  name: string;
  colorHex: string;
  description: string;
  articleCount?: number;
};

const factionsStore: Faction[] = [
  {
    id: "fac-1",
    name: "Північні Землі",
    colorHex: "#3b82f6",
    description: "Держава гірських фортець і торгових міст.",
  },
  {
    id: "fac-2",
    name: "Південний Союз",
    colorHex: "#10b981",
    description: "Конфедерація приморських поселень і ремісників.",
  },
  {
    id: "fac-3",
    name: "Орден Хранителів",
    colorHex: "#8b5cf6",
    description: "Спільнота вчених, які оберігають старовинні архіви.",
  },
  {
    id: "fac-4",
    name: "Гільдія Дослідників",
    colorHex: "#f59e0b",
    description: "Мандрівники, що складають географічні карти.",
  },
];

export async function listFactions(): Promise<Faction[]> {
  const items = await withMockMode(factionsStore);
  const allArticles = getRawArticlesInternal();
  return items.map((fac) => ({
    ...fac,
    articleCount: allArticles.filter((a) => a.factionIds.includes(fac.id)).length,
  }));
}

export async function createFaction(input: {
  name: string;
  colorHex: string;
  description: string;
}): Promise<Faction> {
  const name = input.name?.trim();
  const colorHex = input.colorHex?.trim() || "#3b82f6";
  const description = input.description?.trim();

  if (!name || !description) {
    throw new Error("Назва фракції та короткий опис є обов'язковими");
  }

  const created: Faction = {
    id: `fac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    colorHex,
    description,
    articleCount: 0,
  };

  factionsStore.push(created);
  return { ...created };
}

export async function deleteFaction(factionId: string): Promise<void> {
  const idx = factionsStore.findIndex((f) => f.id === factionId);
  if (idx !== -1) {
    factionsStore.splice(idx, 1);
  }
  removeFactionFromAllArticlesInternal(factionId);
}
