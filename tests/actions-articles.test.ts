import { describe, expect, it } from "vitest";
import { saveDraftAction, deleteArticleAction } from "@/app/editor/actions";
import { getArticle } from "@/lib/data/db/articles";
import { submit } from "./helpers/submit";
import { signInAs } from "./helpers/users";

describe("точки доступу: статті вікі", () => {
  it("успішний виклик: співавтор створює чернетку статті, і вона є в базі", async () => {
    const result = await submit(saveDraftAction, {
      title: `тест-чернетка-${Date.now()}`,
      category: "персонаж",
      content: "Детальний опис персонажа вигаданого світу для перевірки створення.",
      status: "чернетка",
    });
    expect(result.status).toBe(201);
    expect(await getArticle(result.id ?? "")).not.toBeNull();
    await submit(deleteArticleAction, { id: result.id ?? "" });
  });

  it("невалідні дані: порожній заголовок статті повз форму відхиляється з кодом 400", async () => {
    const result = await submit(saveDraftAction, {
      title: "   ",
      category: "персонаж",
      content: "Детальний опис персонажа вигаданого світу для перевірки валідації.",
      status: "чернетка",
    });
    expect(result.status).toBe(400);
    expect(result.fieldErrors?.title).toBeTruthy();
  });

  it("чужий запис: акаунт Б не бачить і не видаляє чернетку статті акаунта А", async () => {
    const created = await submit(saveDraftAction, {
      title: `тест-чужа-${Date.now()}`,
      category: "локація",
      content: "Таємна фортеця Хранителів, чернетку якої бачить лише автор.",
      status: "чернетка",
    });
    expect(created.status).toBe(201);

    await signInAs("B");
    expect(await getArticle(created.id ?? "")).toBeNull();
    expect((await submit(deleteArticleAction, { id: created.id ?? "" })).status).toBe(404);

    await signInAs("A");
    expect(await getArticle(created.id ?? "")).not.toBeNull();
    await submit(deleteArticleAction, { id: created.id ?? "" });
  });

  it("невалідна категорія: невідома категорія статті повз форму відхиляється з кодом 400", async () => {
    const result = await submit(saveDraftAction, {
      title: `тест-категорія-${Date.now()}`,
      category: "невідома_категорія",
      content: "Детальний опис матеріалу з некоректною категорією.",
      status: "чернетка",
    });
    expect(result.status).toBe(400);
    expect(result.fieldErrors?.category).toBeTruthy();
  });
});
