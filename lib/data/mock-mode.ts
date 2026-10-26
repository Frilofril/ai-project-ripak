import { connection } from "next/server";

export type MockMode = "data" | "empty" | "slow" | "error";

export const MOCK_MODE: MockMode = "data";

export async function withMockMode<T>(items: T[]): Promise<T[]> {
  if (process.env.VITEST) return items;
  await connection();
  const mode: MockMode = MOCK_MODE;
  if (mode === "slow") await new Promise((resolve) => setTimeout(resolve, 5000));
  if (mode === "error") throw new Error("Не вдалося завантажити дані (макетний режим error)");
  if (mode === "empty") return [];
  return items;
}
