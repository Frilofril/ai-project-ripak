"use server";

import { revalidatePath } from "next/cache";
import { createFaction, deleteFaction } from "@/lib/data/factions";

export async function createFactionAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const colorHex = String(formData.get("colorHex") ?? "#3b82f6");
  const description = String(formData.get("description") ?? "");
  await createFaction({ name, colorHex, description });
  revalidatePath("/factions");
  revalidatePath("/editor");
  revalidatePath("/");
}

export async function deleteFactionAction(formData: FormData) {
  const factionId = String(formData.get("factionId") ?? "");
  await deleteFaction(factionId);
  revalidatePath("/factions");
  revalidatePath("/editor");
  revalidatePath("/");
}
