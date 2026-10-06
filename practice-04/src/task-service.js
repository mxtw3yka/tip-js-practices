// Слой данных ПР2–ПР3, перенесённый в ПР4 без изменения контрактов.
// Для предусмотренных ошибок возвращается { ok: false, error: "..." }.
// DOM, localStorage и внешнее состояние в этом модуле не используются.

export function createTask(id, title, priority = "medium") {
  if (!Number.isSafeInteger(id) || id <= 0){
    return {ok: false, error: "id должен быть положительным безопасным целым числом"};
  }
  if (typeof title !== "string"){
    return {ok: false, error: "Название должно быть строкой"};
  }
  const normalized = title.trim();
  if (normalized.length < 1 || normalized.length > 100){
    return {ok: false, error: "Длина названия от 1 до 100 символов"};
  }
  if (!["low", "medium", "high"].includes(priority)){
    return {ok: false, error: "Приоритет должен быть low, medium или high"};
  }
  return {ok: true, task: {id, title: normalized, completed: false, priority} };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  let completed = 0;
  for (const task of tasks) {
    if (task.completed === true) {
      completed += 1;
    }
  }
  const pending = total - completed;
  const progress = total === 0 ? 0 : (completed / total) * 100;
  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const result = createTask(id, title, priority);
  if(!result.ok) return result;
  if (tasks.some((task) => task.id === id)) {
    return {ok: false, error: "Задача с таким id уже существует"};
  }
  return {ok: true, tasks: [...tasks, result.task]};
}

export function setTaskCompleted(tasks, id, completed) {
  if (!tasks.some(t=> t.id === id)){
    return {ok: false, error: "Задача не найдена"};
  }
  if (typeof completed !== "boolean") {
    return {ok: false, error: "completed должен быть логическим значением"}
  }

  const updatedTasks = tasks.map((t) => t.id === id ? {...t, completed} : t);

  return {ok: true, tasks: updatedTasks};
}



export function renameTask(tasks, id, title) {
  if (!tasks.some(t=> t.id === id)){
    return {ok: false, error: "Задача не найдена"};
  }

  if (typeof title !== "string"){
    return {ok: false, error: "Название должно быть строкой"};
  }
  const normalized = title.trim();
  if (normalized.length < 1 || normalized.length > 100 ){
    return {ok: false, error: "Длина названия от 1 до 100 символов"};
  }

  const updatedTasks = tasks.map((t) => (t.id === id ? {...t, title: normalized} : t));

  return {ok: true, tasks: updatedTasks};
}

export function removeTask(tasks, id) {
  if (!tasks.some(t=> t.id === id)){
    return {ok: false, error: "Задача не найдена"};
  }
  const updatedTasks = tasks.filter((t) => t.id !== id);
  return {ok: true, tasks: updatedTasks};
}

// ПР4: изменение названия и приоритета выбранной задачи.
// id и completed не изменяются, входной массив и его объекты не мутируют.
export function updateTask(tasks, id, title, priority) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    return {ok: false, error: "id должен быть положительным безопасным целым числом"};
  }
  if (!tasks.some((task) => task.id === id)) {
    return {ok: false, error: "Задача не найдена"};
  }
  // Проверки названия и приоритета совпадают с createTask,
  // но готовое значение completed: false здесь не используется.
  const validation = createTask(id, title, priority);
  if (!validation.ok) return validation;

  const updatedTasks = tasks.map((task) => (task.id === id
    ? {...task, title: validation.task.title, priority: validation.task.priority}
    : task));
  return {ok: true, tasks: updatedTasks};
}