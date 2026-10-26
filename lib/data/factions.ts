export type Faction = {
  id: string;
  name: string;
  colorHex: string;
  description: string;
  articleCount?: number;
};

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
    id: "fac-temp",
    name: input.name,
    colorHex: input.colorHex,
    description: input.description,
    articleCount: 0,
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function deleteFaction(_factionId: string): Promise<void> {
  return;
}
