"use server";

// Вхід, реєстрація і вихід (практична робота 5).

import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/action-result";
import { db } from "@/lib/data/db/client";

function nextPath(value: FormDataEntryValue | null): string {
  const path = String(value ?? "/");
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

export async function signInAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { status: 400, message: "Введіть пошту й пароль." };

  try {
    const { error } = await db().auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[signInAction] помилка:", error);
      return { status: 401, message: "Неправильна пошта або пароль." };
    }
  } catch (err: unknown) {
    console.error("[signInAction] виняток:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 400, message: `Помилка сервера під час входу: ${msg}` };
  }

  redirect(nextPath(formData.get("next")));
}

export async function signUpAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fieldErrors: Record<string, string> = {};

  if (!fullName) fieldErrors.full_name = "Вкажіть ім'я.";
  if (!email.includes("@")) fieldErrors.email = "Вкажіть пошту.";
  if (password.length < 6) fieldErrors.password = "Пароль — щонайменше 6 символів.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 400, message: "Перевірте поля реєстрації.", fieldErrors };
  }

  let sessionCreated = false;
  try {
    console.log("[signUpAction] Відправляємо запит у Supabase:", { email, fullName });
    const { data, error } = await db().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    console.log("[signUpAction] Отримано відповідь:", {
      userId: data?.user?.id,
      hasSession: Boolean(data?.session),
      error,
    });

    if (error) {
      const taken = error.code === "user_already_exists";
      return {
        status: 400,
        message: taken ? "Ця пошта вже зареєстрована." : `Реєстрація не вдалася: ${error.message}`,
      };
    }

    if (!data.session) {
      return {
        status: 400,
        message: "Акаунт створено в Supabase, але сесію не надано (потрібне підтвердження пошти).",
      };
    }

    sessionCreated = true;
  } catch (err: unknown) {
    console.error("[signUpAction] Неочікуваний збій:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 400, message: `Помилка реєстрації: ${msg}` };
  }

  if (sessionCreated) {
    redirect(nextPath(formData.get("next")));
  }

  return { status: 200, message: "Успішно." };
}

export async function signOutAction(): Promise<void> {
  try {
    await db().auth.signOut();
  } catch (err) {
    console.error("signOut error:", err);
  }
  redirect("/login");
}