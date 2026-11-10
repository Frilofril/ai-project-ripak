import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";

// Налаштування тестів (практична робота 5).
// Псевдонім @ і змінні з .env.local — як у ПР 4. Нове: перед кожним тестом
// tests/setup.ts виконує вхід тестовим акаунтом А.
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    env: loadEnv(mode, process.cwd(), ""),
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 15000,
  },
}));
