// Результат серверної дії (практична робота 5). Не змінюйте цей файл.
// status — код із таблиці точок доступу:
//   200 — виконано; 201 — створено; 400 — невалідні дані; 401 — не увійшов;
//   403 — немає права на дію; 404 — запису немає або він недоступний цьому користувачу.

export type ActionResult = {
  status: 200 | 201 | 400 | 401 | 403 | 404;
  message?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
};

// true, якщо база відмовила через політики доступу або права ролі.
export function isAccessDenied(error: unknown): boolean {
  return error instanceof Error && /row-level security|permission denied/i.test(error.message);
}
