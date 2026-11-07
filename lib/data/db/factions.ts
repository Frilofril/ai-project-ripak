import type { Faction } from "@/lib/data/factions";

// ЗАГЛУШКА: реалізація на кроці 13
export async function listFactions(): Promise<Faction[]> {
  return [];
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function createFaction(input: {
  name: string;
  colorHex: string;
  description: string;
}): Promise<Faction> {
  return {
    id: "",
    name: input.name,
    colorHex: input.colorHex,
    description: input.description,
    articleCount: 0,
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function deleteFaction(factionId: string): Promise<void> {
  void factionId;
}
