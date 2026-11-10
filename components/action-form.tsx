"use client";

// Форма, що показує відповідь серверної дії (практична робота 5). Не змінюйте цей файл.
// Як використовувати: замість <form action={дія}> напишіть <ActionForm action={дія}>.

import { useActionState, type ReactNode } from "react";
import type { ActionResult } from "@/lib/action-result";

type Action = (previous: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export function ActionForm({
  action,
  children,
  className,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
}) {
  const [result, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {result && result.status >= 400 ? (
        <div role="alert" className="text-sm text-red-600">
          {result.message ? <p>{result.message}</p> : null}
          {result.fieldErrors
            ? Object.entries(result.fieldErrors).map(([field, text]) => <p key={field}>{text}</p>)
            : null}
        </div>
      ) : null}
    </form>
  );
}
