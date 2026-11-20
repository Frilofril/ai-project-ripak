"use server";
// POST /editor — захищена версія генерації чернетки статті за нотаткою автора (тема-15, ПР 6).
import { revalidatePath } from "next/cache";
import { isAccessDenied, type ActionResult } from "@/lib/action-result";
import {
  ARTICLE_DRAFT_SCHEMA,
  NOTE_MAX,
  NOTE_MIN,
  SYSTEM_PROMPT,
  buildUserMessage,
  cacheKey,
  checkDraftReply,
  normalizeNote,
  type GeneratedDraft,
} from "@/lib/ai/article-draft";
import { CACHE_TTL_SECONDS, MODEL_TIMEOUT_MS, aiLimits } from "@/lib/ai/limits";
import {
  askModel,
  modelConfigured,
  ModelNotConfiguredError,
  ModelTimeoutError,
  ModelUnavailableError,
} from "@/lib/ai/model";
import { currentUserId } from "@/lib/auth";
import {
  appCallsToday,
  countMyCallsSince,
  createAiDraftWithFactions,
  listFactionsForAi,
  readCache,
  recordCall,
  writeCache,
} from "@/lib/data/db/ai-guard";

const UNAVAILABLE =
  "Автоматична генерація чернетки зараз недоступна. Заповніть поля статті вручну або спробуйте пізніше.";

export async function generateDraftFromNoteAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) {
    return { status: 401, message: "Увійдіть, щоб згенерувати чернетку статті." };
  }

  const note = String(formData.get("note") ?? "").trim();
  if (!note) {
    return {
      status: 400,
      message: "Перевірте поля форми.",
      fieldErrors: { note: "Введіть нотатку або ідею для генерації чернетки статті." },
    };
  }
  if (note.length < NOTE_MIN) {
    return {
      status: 400,
      message: "Перевірте поля форми.",
      fieldErrors: { note: "Нотатка має містити щонайменше " + NOTE_MIN + " символів." },
    };
  }
  if (note.length > NOTE_MAX) {
    return {
      status: 400,
      message: "Перевірте поля форми.",
      fieldErrors: { note: "Нотатка — не довше " + NOTE_MAX + " символів." },
    };
  }

  if (!modelConfigured()) {
    return { status: 503, message: UNAVAILABLE };
  }

  const factions = await listFactionsForAi();
  const userMessage = buildUserMessage(factions, note);
  const key = cacheKey(buildUserMessage(factions, normalizeNote(note)));

  let draft: GeneratedDraft | null = null;
  const cached = await readCache(key);
  if (cached) {
    const checked = checkDraftReply(cached, factions.length);
    if (checked.ok) {
      draft = checked.value;
      await recordCall(true);
    }
  }

  if (!draft) {
    const limits = aiLimits();
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    if ((await countMyCallsSince(hourAgo)) >= limits.perUserPerHour) {
      return {
        status: 429,
        message:
          "Не більше " +
          limits.perUserPerHour +
          " автоматичних генерацій чернеток на годину. Спробуйте за годину або створіть чернетку вручну.",
      };
    }
    if ((await appCallsToday()) >= limits.appPerDay) {
      return {
        status: 429,
        message: "Денний ліміт автоматичних генерацій для застосунку вичерпано. Спробуйте завтра.",
      };
    }

    for (let attempt = 1; attempt <= 2 && !draft; attempt++) {
      try {
        await recordCall(false);
        const reply = await askModel({
          system: SYSTEM_PROMPT,
          user: userMessage,
          jsonSchema: ARTICLE_DRAFT_SCHEMA,
          timeoutMs: MODEL_TIMEOUT_MS,
        });
        const checked = checkDraftReply(reply.text, factions.length);
        if (checked.ok) {
          draft = checked.value;
          await writeCache(key, reply.text, CACHE_TTL_SECONDS);
        }
      } catch (error) {
        if (error instanceof ModelTimeoutError) {
          return { status: 503, message: "Модель не відповіла вчасно. " + UNAVAILABLE };
        }
        if (error instanceof ModelUnavailableError || error instanceof ModelNotConfiguredError) {
          return { status: 503, message: "Сервіс моделі недоступний. " + UNAVAILABLE };
        }
        throw error;
      }
    }

    if (!draft) {
      return { status: 503, message: "Модель відповіла не за форматом. " + UNAVAILABLE };
    }
  }

  const selectedFactionIds = draft.factionNumbers.map((n) => factions[n - 1].id);
  let createdId = "";
  try {
    const created = await createAiDraftWithFactions({
      userId,
      title: draft.title,
      category: draft.category,
      content: draft.content,
      factionIds: selectedFactionIds,
    });
    createdId = created.id;
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Створювати чернетки статей можуть лише співавтори та редактори." };
    }
    throw error;
  }

  revalidatePath("/editor");
  return {
    status: 201,
    id: createdId,
    message:
      "Чернетку статті «" +
      draft.title +
      "» створено за нотаткою (прив'язано фракцій: " +
      selectedFactionIds.length +
      ").",
  };
}
