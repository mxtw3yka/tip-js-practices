// Заготовка модуля. throw ниже отмечает отсутствие реализации,
// а не способ обработки некорректных данных в готовом решении.
// Для предусмотренных ошибок необходимо возвращать { ok: false, error: "..." }.
// console.log(), prompt(), document и чтение внешнего состояния здесь не нужны.

export function createTask(id, title, priority = "medium") {
  if (!Number.isSafeInteger(id) || id <= 0){
    return {ok: false, error: "id должен быть положительным или беопасным числом"};
  }
  if (typeof title !== "string"){
    return {ok: false, error: "Название должно быть строкой"};
  }
  const normalized = title.trim();
  if (normalized.length < 1 || normalized.length > 100){
    return {ok: false, error: "Длина названия от 1 до 100 символов"};
  }
  if (!["low", "medium", "high"].includes(priority)){
    return {ok: false, error: "Приоритет должент быть low, medium или high"};
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
    return {ok: false, error: "Не верный тип данных"}
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