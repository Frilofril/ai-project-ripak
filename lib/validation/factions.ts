// Серверна валідація форм для довідника фракцій (практична робота 5).
import { isValidUuid, type Checked } from "./articles";

export type FactionInput = {
  name: string;
  colorHex: string;
  description: string;
};

export function checkFaction(formData: FormData): Checked<FactionInput> {
  const name = String(formData.get("name") ?? "").trim();
  const colorHex = String(formData.get("colorHex") ?? formData.get("color_hex") ?? "#3b82f6").trim();
  const description = String(formData.get("description") ?? "").trim();
  const fieldErrors: Record<string, string> = {};

  if (!name) {
    fieldErrors.name = "Назва фракції обов'язкова (від 2 до 80 символів).";
  } else if (name.length < 2 || name.length > 80) {
    fieldErrors.name = "Назва фракції має містити від 2 до 80 символів.";
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(colorHex)) {
    fieldErrors.colorHex = "Колір мітки має бути у форматі #RRGGBB.";
  }

  if (!description) {
    fieldErrors.description = "Короткий опис фракції обов'язковий (від 5 до 500 символів).";
  } else if (description.length < 5 || description.length > 500) {
    fieldErrors.description = "Опис фракції має містити від 5 до 500 символів.";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, value: { name, colorHex, description } };
}

export function checkFactionId(formData: FormData): Checked<{ factionId: string }> {
  const factionId = String(formData.get("factionId") ?? formData.get("id") ?? "").trim();
  if (!isValidUuid(factionId)) {
    return { ok: false, fieldErrors: { factionId: "Некоректний ідентифікатор фракції." } };
  }
  return { ok: true, value: { factionId } };
}
