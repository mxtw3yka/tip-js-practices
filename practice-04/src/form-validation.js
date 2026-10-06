const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
// Успех: { ok: true, value: { id, title, priority } }.
// Отказ: { ok: false, errors: { id?: "...", title?: "...", priority?: "..." } }.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const list = Array.isArray(tasks) ? tasks : [];

  let id;
  if (editingId !== null) {
    // Режим редактирования: источник id — editingId, draft.id не используется.
    id = editingId;
    if (!Number.isSafeInteger(id) || id <= 0) {
      errors.id = "Идентификатор редактируемой задачи должен быть положительным целым числом.";
    } else if (!list.some((task) => task.id === id)) {
      errors.id = "Редактируемая задача не найдена в текущем списке.";
    }
  } else {
    const rawId = draft === null || draft === undefined ? undefined : draft.id;
    if (typeof rawId !== "string" && typeof rawId !== "number") {
      errors.id = "Укажите числовой идентификатор от 1 до " + Number.MAX_SAFE_INTEGER + ".";
    } else {
      // Пустая строка даёт 0 и отклоняется вместе с остальными неверными значениями.
      id = Number(rawId);
      if (rawId === "" || !Number.isSafeInteger(id) || id <= 0) {
        errors.id = "Идентификатор должен быть положительным целым числом.";
      } else if (list.some((task) => task.id === id)) {
        errors.id = "Задача с таким идентификатором уже существует.";
      }
    }
  }

  const rawTitle = draft === null || draft === undefined ? undefined : draft.title;
  let title = "";
  if (typeof rawTitle !== "string") {
    errors.title = "Название должно быть строкой от 1 до 100 символов.";
  } else {
    title = rawTitle.trim();
    if (title.length === 0) {
      errors.title = "Название не должно состоять только из пробелов.";
    } else if (title.length > 100) {
      errors.title = "Длина названия после удаления пробелов не может превышать 100 символов.";
    }
  }

  const priority = draft === null || draft === undefined ? undefined : draft.priority;
  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Допустимые значения приоритета: low, medium или high.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: { id, title, priority } };
}
