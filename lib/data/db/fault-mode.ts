// Режим збою бази (практична робота 5): перевірка станів екранів на справжніх даних.
// Змініть значення FAULT_MODE, збережіть файл (Ctrl+S) і оновіть сторінку в браузері (F5):
//   "none" — звичайна робота;
//   "slow" — кожен запит до бази чекає 5 секунд (видно стан «завантаження»);
//   "down" — база недоступна: кожен запит завершується помилкою мережі (видно стан «помилка»).
// Перед кожним комітом поверніть "none". Під час тестів (npm test) режим завжди "none".

export type FaultMode = "none" | "slow" | "down";

export const FAULT_MODE: FaultMode = "none";

export const faultFetch: typeof fetch = async (input, init) => {
  const mode = (process.env.VITEST ? "none" : FAULT_MODE) as FaultMode;
  if (mode === "slow") await new Promise((resolve) => setTimeout(resolve, 5000));
  if (mode === "down") throw new TypeError("fetch failed: база недоступна (режим збою down)");
  return fetch(input, init);
};
