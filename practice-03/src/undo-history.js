// Расширение (Вариант Б): однократная отмена последнего удаления.
// Хранит копию последней удалённой записи и её прежний индекс в массиве.
// removeTask из ПР2 не изменяется: вся дополнительная логика находится здесь и в main.js.

export function rememberRemoval(tasks, taskId) {
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index === -1) {
    return { task: null, index: -1 };
  }
  return { task: { ...tasks[index] }, index };
}

export function restoreRemoval(tasks, entry) {
  if (entry === null || entry.task === null || typeof entry.index !== "number") {
    return { ok: false };
  }
  const next = [...tasks];
  next.splice(entry.index, 0, { ...entry.task });
  return { ok: true, tasks: next };
}