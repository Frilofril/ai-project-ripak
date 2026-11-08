import { describe, expect, it } from "vitest";
import {
  deleteArticle,
  getArticle,
  listPublishedArticles,
  saveDraftArticle,
  updateArticleStatus,
} from "@/lib/data/db/articles";
import { createFaction, deleteFaction } from "@/lib/data/db/factions";
import { db } from "@/lib/data/db/client";

async function cleanupTestProfiles(prefix: string) {
  await db().from("profiles").delete().ilike("full_name", `${prefix}%`);
}

describe("статті та фракції вікі в базі даних Supabase", () => {
  it("створена чернетка статті читається назад із бази за id", async () => {
    const stamp = Date.now();
    const title = `тест-стаття-${stamp}`;
    const authorName = `тест-автор-${stamp}`;
    const created = await saveDraftArticle({
      title,
      category: "локація",
      content: "Опис стародавньої обсерваторії на вершині хребта.",
      factionIds: [],
      authorName,
    });

    const found = await getArticle(created.id);
    expect(found).not.toBeNull();
    expect(found?.title).toBe(title);
    expect(found?.category).toBe("локація");

    if (created.id) await deleteArticle(created.id);
    await cleanupTestProfiles("тест-автор-");
  });

  it("видалена стаття не знаходиться в базі", async () => {
    const stamp = Date.now();
    const authorName = `тест-автор-${stamp}`;
    const created = await saveDraftArticle({
      title: `тест-видалення-${stamp}`,
      category: "подія",
      content: "Тимчасовий запис літопису для перевірки видалення.",
      factionIds: [],
      authorName,
    });

    expect(await getArticle(created.id)).not.toBeNull();
    await deleteArticle(created.id);
    expect(await getArticle(created.id)).toBeNull();
    await cleanupTestProfiles("тест-автор-");
  });

  it("порожній заголовок статті не приймається базою", async () => {
    await expect(
      saveDraftArticle({
        title: "   ",
        category: "персонаж",
        content: "Текст без заголовка має бути відхилений перевіркою check.",
        factionIds: [],
        authorName: `тест-автор-${Date.now()}`,
      }),
    ).rejects.toThrow();
    await cleanupTestProfiles("тест-автор-");
  });

  it("оновлення статусу статті на «опубліковано» додає її у видачу каталогу", async () => {
    const stamp = Date.now();
    const title = `тест-публікація-${stamp}`;
    const authorName = `тест-автор-${stamp}`;
    const created = await saveDraftArticle({
      title,
      category: "артефакт",
      content: "Магічний компас мореплавців Південного Союзу.",
      factionIds: [],
      authorName,
    });

    await updateArticleStatus(created.id, "опубліковано");
    const published = await listPublishedArticles({ query: title });
    expect(published.some((a) => a.id === created.id)).toBe(true);

    if (created.id) await deleteArticle(created.id);
    await cleanupTestProfiles("тест-автор-");
  });

  it("зв'язок «багато до багатьох» між статтею і фракцією зберігається та каскадно очищується", async () => {
    const stamp = Date.now();
    const authorName = `тест-автор-${stamp}`;
    const faction = await createFaction({
      name: `тест-фракція-${stamp}`,
      colorHex: "#10b981",
      description: "Тимчасовий орден для перевірки таблиці зв'язку article_factions.",
    });

    const article = await saveDraftArticle({
      title: `тест-звязок-${stamp}`,
      category: "локація",
      content: "Фортеця, що належить тестовій фракції.",
      factionIds: [faction.id],
      authorName,
    });

    const withFaction = await getArticle(article.id);
    expect(withFaction?.factionIds).toContain(faction.id);

    await deleteFaction(faction.id);
    const afterDelete = await getArticle(article.id);
    expect(afterDelete?.factionIds).not.toContain(faction.id);

    if (article.id) await deleteArticle(article.id);
    await cleanupTestProfiles("тест-автор-");
  });
});
