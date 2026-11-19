"use server";
// Наївна версія функції на базі моделі (практична робота 6, крок 4).
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import { askModel } from "@/lib/ai/model";
import { currentUserId } from "@/lib/auth";
import { createAiDraftWithFactions, listFactionsForAi } from "@/lib/data/db/ai-guard";

export async function generateDraftFromNoteAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { status: 401, message: "Увійдіть, щоб згенерувати чернетку статті." };

  const note = String(formData.get("note") ?? "").trim();
  const factions = await listFactionsForAi();
  const list =
    factions.length > 0
      ? factions.map((f, i) => `${i + 1}. ${f.name} — ${f.description}`).join("\n")
      : "(список фракцій порожній)";

  const reply = await askModel({
    system:
      "Ти допомагаєш автору спільної вікі вигаданого світу створити чернетку статті лору. " +
      'Поверни ТІЛЬКИ чистий JSON без ```json обгортки у форматі {"title":"...","category":"локація","content":"...","factionNumbers":[1]}, ' +
      'де category — одне зі значень: "персонаж", "локація", "подія", "артефакт", content — від 60 до 500 символів, а factionNumbers — номери фракцій зі списку. Нотатка автора: ' +
      note,
    user: "Список фракцій світу:\n" + list,
  });

  const parsed = JSON.parse(reply.text);
  const rawNums: number[] = Array.isArray(parsed.factionNumbers) ? parsed.factionNumbers : [];
  const factionIds = rawNums.map((n) => factions[n - 1].id);

  const created = await createAiDraftWithFactions({
    userId,
    title: String(parsed.title ?? "Нова чернетка"),
    category: String(parsed.category ?? "локація"),
    content: String(parsed.content ?? ""),
    factionIds,
  });

  revalidatePath("/editor");
  return {
    status: 201,
    id: created.id,
    message:
      "Чернетку статті «" +
      String(parsed.title ?? "Нова чернетка") +
      "» створено за нотаткою (прив'язано фракцій: " +
      factionIds.length +
      ").",
  };
}
