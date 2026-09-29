// Расширение (Вариант А): поиск задач по подстроке в названии.
// Поиск не зависит от регистра и не изменяет исходный массив.
// Ошибки оформлены так же, как в task-service.js: { ok: false, error: "..." }.
export function searchTasks(tasks, query) {
  if (typeof query !== "string") {
    return { ok: false, error: "Запрос должен быть строкой" };
  }
  const normalized = query.trim();
  if (normalized.length < 1 || normalized.length > 100) {
    return { ok: false, error: "Длина запроса от 1 до 100 символов" };
  }
  const lower = normalized.toLowerCase();
  const found = tasks.filter((task) => task.title.toLowerCase().includes(lower));
  return { ok: true, tasks: found };
}