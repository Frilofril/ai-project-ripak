// Модуль даних фракцій (ПР 5): екрани отримують фракції з бази через функції lib/data/db/.
export type Faction = {
  id: string;
  name: string;
  colorHex: string;
  description: string;
  articleCount: number;
};

export { listFactions, createFaction, deleteFaction } from "./db/factions";