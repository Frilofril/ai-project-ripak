import { db } from "./client";
import type { Faction } from "@/lib/data/factions";

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
    .select("id, name, color_hex, description, article_factions(article_id)")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as FactionRow[]).map(toFaction);
}

export async function createFaction(input: {
  name: string;
  colorHex: string;
  description: string;
}): Promise<Faction> {
  const name = input.name.trim();
  const colorHex = input.colorHex.trim();
  const description = input.description.trim();

  const { data, error } = await db()
    .from("factions")
    .insert({
      name,
      color_hex: colorHex,
      description,
    })
    .select("id, name, color_hex, description")
    .single();

  if (error) throw new Error(error.message);
  return toFaction(data as unknown as FactionRow);
}

export async function deleteFaction(factionId: string): Promise<boolean> {
  const { data, error } = await db()
    .from("factions")
    .delete()
    .eq("id", factionId)
    .select("id");

  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}
