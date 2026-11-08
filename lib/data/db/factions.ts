import type { Faction } from "@/lib/data/factions";
import { db } from "./client";

type FactionRow = {
  id: string;
  name: string;
  color_hex: string;
  description: string;
  article_factions?: { article_id: string }[] | null;
};

function toFaction(row: FactionRow): Faction {
  return {
    id: row.id,
    name: row.name,
    colorHex: row.color_hex,
    description: row.description,
    articleCount: (row.article_factions ?? []).length,
  };
}

export async function listFactions(): Promise<Faction[]> {
  const { data, error } = await db()
    .from("factions")
    .select("id, name, color_hex, description, article_factions(article_id)");
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as FactionRow[]).map(toFaction);
}

export async function createFaction(input: {
  name: string;
  colorHex: string;
  description: string;
}): Promise<Faction> {
  const { data, error } = await db()
    .from("factions")
    .insert({
      name: input.name,
      color_hex: input.colorHex,
      description: input.description,
    })
    .select("id, name, color_hex, description")
    .single();
  if (error) throw new Error(error.message);
  return toFaction(data as unknown as FactionRow);
}

export async function deleteFaction(factionId: string): Promise<void> {
  const { error } = await db().from("factions").delete().eq("id", factionId);
  if (error) throw new Error(error.message);
}
