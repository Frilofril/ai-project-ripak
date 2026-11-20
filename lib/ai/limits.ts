// Ліміти споживання функції на базі моделі (тема-15 «Спільна вікі вигаданого світу», ПР 6).
function readLimit(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

export function aiLimits(): { perUserPerHour: number; appPerDay: number } {
  return {
    perUserPerHour: readLimit("AI_USER_LIMIT_PER_HOUR", 10),
    appPerDay: readLimit("AI_APP_LIMIT_PER_DAY", 200),
  };
}

export const MODEL_TIMEOUT_MS = 90_000;
export const CACHE_TTL_SECONDS = 24 * 60 * 60;
