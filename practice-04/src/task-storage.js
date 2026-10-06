export const STORAGE_VERSION = 1;

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Все функции принимают объект storage явно, чтобы их можно было проверить
// без обращения к глобальному window.localStorage. Исключения наружу не выпускаются.

function copyTasks(tasks) {
  return tasks.map((task) => ({ ...task }));
}

// Проверка полной схемы: массив, поля каждой задачи и уникальность id.
// Значение не исправляется — данные либо соответствуют схеме, либо отклоняются целиком.
export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;

  const seenIds = new Set();
  for (const task of value) {
    if (task === null || typeof task !== "object" || Array.isArray(task)) return false;

    const { id, title, completed, priority } = task;
    if (!Number.isSafeInteger(id) || id <= 0) return false;
    if (seenIds.has(id)) return false;
    seenIds.add(id);

    if (typeof title !== "string") return false;
    const normalized = title.trim();
    if (normalized.length < 1 || normalized.length > 100) return false;
    if (title !== normalized) return false;

    if (typeof completed !== "boolean") return false;
    if (!ALLOWED_PRIORITIES.has(priority)) return false;
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallback = copyTasks(Array.isArray(fallbackTasks) ? fallbackTasks : []);

  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return { ok: true, source: "initial", tasks: fallback };
    }

    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallback,
        error: "Сохранённая запись не является объектом { version, tasks }.",
      };
    }
    if (parsed.version !== STORAGE_VERSION) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallback,
        error: `Неизвестная версия сохранённых данных: ${JSON.stringify(parsed.version)}.`,
      };
    }
    if (!isValidTaskList(parsed.tasks)) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallback,
        error: "Сохранённый список задач не соответствует ожидаемой схеме.",
      };
    }

    return { ok: true, source: "storage", tasks: copyTasks(parsed.tasks) };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallback,
      error: `Не удалось прочитать данные из localStorage: ${error.message}`,
    };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Список задач не соответствует схеме сохранения." };
  }

  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось сохранить данные в localStorage: ${error.message}` };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось удалить данные из localStorage: ${error.message}` };
  }
}
