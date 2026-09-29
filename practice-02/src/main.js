import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";
import { searchTasks } from "./task-extra.js";

function printState(label, tasks) {
  // Деструктуризация сводки, как требует задание 5.
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`${label}: всего=${total}, выполнено=${completed}, осталось=${pending}, прогресс=${progress.toFixed(1)}%`);
}

function commit(label, current, result) {
  if (result.ok === false) {
    console.log(`Ошибка на шаге «${label}»: ${result.error} — состояние не изменено`);
    return current;
  }
  printState(label, result.tasks);
  return result.tasks;
}

console.log("ПР2. Демонстрация работы модуля задач\n");

console.log("Общий контрольный набор demoTasks:");
console.table(demoTasks);

let current = demoTasks;

printState("Исходное состояние", current);
current = commit("Добавление «Добавить проверку» (id=20,high)", current, addTask(current, 20, "Добавить проверку", "high"));
current = commit("Отметить выполненной задачу id=4", current, setTaskCompleted(current, 4, true));
current = commit("Переименовать задачу id=10", current, renameTask(current, 10, "Подготовить инструкцию запуска"));
current = commit("Удалить задачу id=7", current, removeTask(current, 7));
current = commit("Повторное добавление id=4", current, addTask(current, 4, "Дубликат", "high"));
current = commit('Неверный статус "true" для id=4', current, setTaskCompleted(current, 4, "true"));
current = commit("Удаление отсутствующего id=777", current, removeTask(current, 777));
current = commit("Пустое название при переименовании id=10", current, renameTask(current, 10, "   "));

console.log("\nРезультат общего сценария (исходный demoTasks не изменён):");
console.table(current);
console.log("Исходный массив demoTasks остался без изменений:");
console.table(demoTasks);

// ------------------------------------------------------------
// Индивидуальный сценарий: вариант 4 «Подготовка семинара»
// ------------------------------------------------------------
console.log(`\nИндивидуальный сценарий (вариант ${variantNumber}) — исходный набор:`);
console.table(variantTasks);

current = variantTasks;

printState("Исходное состояние варианта", current);
current = commit("Добавление «Подготовить план выступления» (id=80,high)", current, addTask(current, 80, "Подготовить план выступления", "high"));
current = commit("Отметить выполненной задачу id=11 (уже выполнена)", current, setTaskCompleted(current, 11, true));
current = commit("Переименовать задачу id=23", current, renameTask(current, 23, "Систематизировать материалы семинара"));
current = commit("Удалить задачу id=37", current, removeTask(current, 37));
current = commit("Повторное добавление id=80", current, addTask(current, 80, "Дубликат", "high"));

console.log("\nИтоговый набор варианта:");
console.table(current);
printState("Итоговое состояние варианта", current);

// Расширение (Вариант А): поиск по подстроке без учёта регистра.
const searchResult = searchTasks(current, "подготовить");
console.log("\nРасширение. Поиск «подготовить» в названиях (без учёта регистра):");
console.table(searchResult.tasks);
const invalidSearch = searchTasks(current, 123);
console.log(`Расширение. Некорректный запрос: ${invalidSearch.error}`);