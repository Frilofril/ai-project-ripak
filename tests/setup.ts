// Спільне налаштування тестів (практична робота 5). Не змінюйте цей файл.
// Перед кожним тестом — вхід акаунтом А. Тест, якому потрібен акаунт Б, викликає signInAs("B").
// revalidatePath і revalidateTag працюють лише всередині Next.js, тому в тестах вони нічого не роблять.

import { beforeEach, vi } from "vitest";
import { signInAs } from "./helpers/users";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

beforeEach(async () => {
  await signInAs("A");
});
