import { describe, expect, it } from "vitest";
import {
  attachArticleImage,
  getArticle,
  listPublishedArticles,
  saveDraftArticle,
  updateArticleStatus,
} from "@/lib/data/articles";
import { createFaction, deleteFaction } from "@/lib/data/factions";
import {
  listComplaints,
  resolveComplaint,
  submitComplaint,
} from "@/lib/data/complaints";

describe("спільна вікі світу", () => {
  it("порожній заголовок або опис не створює чернетку статті", async () => {
    await expect(
      saveDraftArticle({
        title: "   ",
        category: "локація",
        content: "",
        factionIds: [],
      })
    ).rejects.toThrow();
  });

  it("після публікації редактором стаття з'являється у каталозі опублікованих", async () => {
    const draft = await saveDraftArticle({
      title: "Цитадель Північного Перевалу",
      category: "локація",
      content: "Давня гірська твердиня на межі провінцій.",
      factionIds: ["fac-1"],
    });
    await updateArticleStatus(draft.id, "на перевірці");
    await updateArticleStatus(draft.id, "опубліковано");

    const publishedTitles = (await listPublishedArticles()).map((a) => a.title);
    expect(publishedTitles).toContain("Цитадель Північного Перевалу");
  });

  it("завантаження нової ілюстрації перезаписує посилання на файл у статті", async () => {
    const draft = await saveDraftArticle({
      title: "Карта Східного тракту",
      category: "локація",
      content: "Торговий шлях між містами.",
      factionIds: [],
    });
    await attachArticleImage(draft.id, "map-citadel-v1.png", 1.8);
    const updated = await attachArticleImage(
      draft.id,
      "map-citadel-v2.webp",
      2.4
    );
    expect(updated.imageUrl).toBe("storage://wiki-media/map-citadel-v2.webp");
  });

  it("видалення фракції каскадно прибирає її мітку з прив'язаних статей", async () => {
    const faction = await createFaction({
      name: "Тимчасовий Орден",
      colorHex: "#8b5cf6",
      description: "Орден, який буде розформовано.",
    });
    const article = await saveDraftArticle({
      title: "Літопис Ордену",
      category: "подія",
      content: "Історія створення та занепаду.",
      factionIds: [faction.id],
    });

    await deleteFaction(faction.id);
    const afterDelete = await getArticle(article.id);
    expect(afterDelete?.factionIds ?? [faction.id]).not.toContain(faction.id);
  });

  it("прийняття скарги повертає статтю в чернетки і закриває всі скарги на неї", async () => {
    const draft = await saveDraftArticle({
      title: "Суперечлива хроніка",
      category: "подія",
      content: "Текст, що містить помилку в датах.",
      factionIds: [],
    });
    await updateArticleStatus(draft.id, "опубліковано");

    const c1 = await submitComplaint({
      articleId: draft.id,
      reason: "Неточність у назві гірського перевалу",
    });
    const c2 = await submitComplaint({
      articleId: draft.id,
      reason: "Невірна дата битви",
    });

    const resolved = await resolveComplaint(c1.id, "вирішено");
    expect(resolved.status).toBe("вирішено");

    const updatedArticle = await getArticle(draft.id);
    expect(updatedArticle?.status).toBe("чернетка");

    const allComplaints = await listComplaints(false);
    const second = allComplaints.find((c) => c.id === c2.id);
    expect(second?.status).toBe("вирішено");
  });
});
