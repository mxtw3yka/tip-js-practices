import assert from "node:assert/strict";
import { demoTasks } from "./src/data.js";
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
} from "./src/task-service.js";

let passedCount = 0;
let failedCount = 0;

function scenario(name, fn) {
  try {
    fn();
    passedCount += 1;
    console.log(`OK   ${name}`);
  } catch (error) {
    failedCount += 1;
    console.error(`FAIL ${name}`);
    console.error(`     ${error.message}`);
    process.exitCode = 1;
  }
}

function expectError(result, label = "операция") {
  assert.equal(result.ok, false, `${label}: ожидался отказ ok: false`);
  assert.equal(typeof result.error, "string", `${label}: ожидалось строковое поле error`);
  assert.ok(result.error.length > 0, `${label}: сообщение об ошибке не должно быть пустым`);
}

function snapshot(tasks) {
  return tasks.map((task) => ({ ...task }));
}

// --- Задание 2: createTask ---

scenario("createTask: успешное создание задачи", () => {
  const result = createTask(20, "Новая задача", "high");
  assert.equal(result.ok, true);
  assert.deepStrictEqual(result.task, {
    id: 20,
    title: "Новая задача",
    completed: false,
    priority: "high",
  });
});

scenario("createTask: приоритет по умолчанию", () => {
  const omitted = createTask(1, "Без приоритета");
  const explicitUndefined = createTask(2, "Без приоритета", undefined);
  assert.equal(omitted.ok, true);
  assert.equal(omitted.task.priority, "medium");
  assert.equal(explicitUndefined.ok, true);
  assert.equal(explicitUndefined.task.priority, "medium");
});

scenario("createTask: нормализация краевых пробелов", () => {
  const result = createTask(5, "  Проверить  данные  ");
  assert.equal(result.ok, true);
  assert.equal(result.task.title, "Проверить  данные");
});

scenario("createTask: граничная длина названия", () => {
  const minLength = createTask(1, "a");
  const maxLength = createTask(2, "a".repeat(100));
  const tooLong = createTask(3, "a".repeat(101));
  assert.equal(minLength.ok, true);
  assert.equal(minLength.task.title.length, 1);
  assert.equal(maxLength.ok, true);
  assert.equal(maxLength.task.title.length, 100);
  expectError(tooLong, "название из 101 символа");
});

scenario("createTask: пустое и пробельное название", () => {
  expectError(createTask(1, ""), "пустая строка");
  expectError(createTask(2, "   \t "), "строка из пробелов");
});

scenario("createTask: не строковое название", () => {
  expectError(createTask(1, 42), "число 42");
  expectError(createTask(2, null), "null");
  expectError(createTask(3, undefined), "undefined");
});

scenario("createTask: некорректные идентификаторы", () => {
  const invalidIds = [0, -1, 1.5, "4", NaN, Infinity, null, undefined];
  for (const id of invalidIds) {
    expectError(createTask(id, "Задача"), `id: ${String(id)}`);
  }
});

scenario("createTask: границы безопасного целого числа", () => {
  const maxOk = createTask(Number.MAX_SAFE_INTEGER, "Крайний идентификатор");
  assert.equal(maxOk.ok, true);
  assert.equal(maxOk.task.id, Number.MAX_SAFE_INTEGER);
  expectError(
    createTask(Number.MAX_SAFE_INTEGER + 1, "Слишком большой"),
    "MAX_SAFE_INTEGER + 1",
  );
});

scenario("createTask: некорректный приоритет", () => {
  const invalidPriorities = ["urgent", "HIGH", " high ", null, 1, true];
  for (const priority of invalidPriorities) {
    expectError(createTask(1, "Задача", priority), `priority: ${String(priority)}`);
  }
  assert.equal(createTask(1, "A", "low").ok, true);
  assert.equal(createTask(2, "B", "medium").ok, true);
  assert.equal(createTask(3, "C", "high").ok, true);
});

scenario("createTask: одинаковые аргументы — разные объекты", () => {
  const first = createTask(9, "Одинаковая задача", "low");
  const second = createTask(9, "Одинаковая задача", "low");
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.deepStrictEqual(first.task, second.task);
  assert.notStrictEqual(first.task, second.task);
});

// --- Задание 3: чтение списка и сводка ---

scenario("findTaskById: поиск по идентификатору", () => {
  const byFour = findTaskById(demoTasks, 4);
  assert.notStrictEqual(byFour, undefined);
  assert.strictEqual(byFour, demoTasks[1]);
  assert.equal(byFour.id, 4);
  assert.equal(byFour.title, "Подготовить модель задач");
  const byOne = findTaskById(demoTasks, 1);
  assert.strictEqual(byOne, demoTasks[0]);
});

scenario("findTaskById: отсутствующие и строковый id", () => {
  assert.equal(findTaskById(demoTasks, 777), undefined);
  assert.equal(findTaskById(demoTasks, "4"), undefined);
  assert.equal(findTaskById([], 1), undefined);
});

scenario("getPendingTasks: невыполненные задачи набора", () => {
  const pending = getPendingTasks(demoTasks);
  assert.deepStrictEqual(pending.map((task) => task.id), [4, 7]);
  assert.strictEqual(pending[0], demoTasks[1]);
  assert.strictEqual(pending[1], demoTasks[2]);
});

scenario("getPendingTasks: пустой и завершённый списки", () => {
  assert.deepStrictEqual(getPendingTasks([]), []);
  const allCompleted = [
    { id: 1, title: "A", completed: true, priority: "low" },
    { id: 2, title: "B", completed: true, priority: "high" },
  ];
  assert.deepStrictEqual(getPendingTasks(allCompleted), []);
});

scenario("getPendingTasks: список без выполненных задач", () => {
  const noneCompleted = [
    { id: 1, title: "A", completed: false, priority: "low" },
    { id: 2, title: "B", completed: false, priority: "medium" },
  ];
  const result = getPendingTasks(noneCompleted);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0], noneCompleted[0]);
  assert.strictEqual(result[1], noneCompleted[1]);
});

scenario("getTaskTitles: названия всех задач", () => {
  assert.deepStrictEqual(getTaskTitles(demoTasks), [
    "Изучить функции",
    "Подготовить модель задач",
    "Проверить методы массивов",
    "Оформить README",
  ]);
  assert.deepStrictEqual(getTaskTitles([]), []);
});

scenario("getTaskStats: сводка общего набора", () => {
  assert.deepStrictEqual(getTaskStats(demoTasks), {
    total: 4,
    completed: 2,
    pending: 2,
    progress: 50,
  });
});

scenario("getTaskStats: сводка пустого списка", () => {
  assert.deepStrictEqual(getTaskStats([]), {
    total: 0,
    completed: 0,
    pending: 0,
    progress: 0,
  });
});

scenario("getTaskStats: прогресс 0%, 100% и 33.3%", () => {
  const makeTasks = (flags) =>
    flags.map((completed, index) => ({
      id: index + 1,
      title: `Задача ${index + 1}`,
      completed,
      priority: "medium",
    }));
  const noneCompleted = getTaskStats(makeTasks([false, false, false, false]));
  assert.equal(noneCompleted.progress, 0);
  const allCompleted = getTaskStats(makeTasks([true, true, true, true]));
  assert.equal(allCompleted.progress, 100);
  const oneOfThree = getTaskStats(makeTasks([true, false, false]));
  assert.ok(
    Math.abs(oneOfThree.progress - 100 / 3) < 1e-9,
    `progress=${oneOfThree.progress}`,
  );
  assert.equal(oneOfThree.progress.toFixed(1), "33.3");
});

// --- Задание 4: addTask ---

scenario("addTask: добавление в общий набор", () => {
  const before = snapshot(demoTasks);
  const result = addTask(demoTasks, 20, "Добавить проверку", "high");
  assert.equal(result.ok, true);
  assert.notStrictEqual(result.tasks, demoTasks);
  assert.strictEqual(result.tasks.length, 5);
  assert.deepStrictEqual(result.tasks[4], {
    id: 20,
    title: "Добавить проверку",
    completed: false,
    priority: "high",
  });
  assert.strictEqual(demoTasks.length, 4);
  assert.deepStrictEqual(demoTasks, before);
});

scenario("addTask: добавление в пустой список", () => {
  const empty = [];
  const result = addTask(empty, 5, "Единственная задача", "low");
  assert.equal(result.ok, true);
  assert.strictEqual(result.tasks.length, 1);
  assert.strictEqual(result.tasks[0].id, 5);
  assert.strictEqual(empty.length, 0);
});

scenario("addTask: дубликат идентификатора", () => {
  const before = snapshot(demoTasks);
  const result = addTask(demoTasks, 4, "Повторная задача", "low");
  expectError(result, "дубликат id = 4");
  assert.deepStrictEqual(demoTasks, before);
});

scenario("addTask: некорректные поля и идентификатор", () => {
  const before = snapshot(demoTasks);
  expectError(addTask(demoTasks, 4.5, "Дробный id"), "дробный id");
  expectError(addTask(demoTasks, "4", "Строковый id"), "строковый id");
  expectError(addTask(demoTasks, 21, ""), "пустое название");
  expectError(addTask(demoTasks, 21, "OK", "urgent"), "приоритет urgent");
  expectError(addTask(demoTasks, 21, 42), "числовое название");
  assert.deepStrictEqual(demoTasks, before);
});

// --- Задание 4: setTaskCompleted ---

scenario("setTaskCompleted: изменение статуса туда и обратно", () => {
  const before = snapshot(demoTasks);
  const originalTask = demoTasks[1];

  const toTrue = setTaskCompleted(demoTasks, 4, true);
  assert.equal(toTrue.ok, true);
  assert.notStrictEqual(toTrue.tasks, demoTasks);
  const updatedTask = toTrue.tasks[1];
  assert.equal(updatedTask.completed, true);
  assert.notStrictEqual(updatedTask, originalTask);
  assert.equal(updatedTask.id, originalTask.id);
  assert.equal(updatedTask.title, originalTask.title);
  assert.equal(updatedTask.priority, originalTask.priority);
  assert.strictEqual(toTrue.tasks[0], demoTasks[0]);

  const toFalse = setTaskCompleted(toTrue.tasks, 4, false);
  assert.equal(toFalse.ok, true);
  assert.equal(toFalse.tasks[1].completed, false);
  assert.notStrictEqual(toFalse.tasks[1], updatedTask);
  assert.equal(toTrue.tasks[1].completed, true);

  assert.deepStrictEqual(demoTasks, before);
});

scenario("setTaskCompleted: недопустимое значение статуса", () => {
  const before = snapshot(demoTasks);
  const invalidValues = ["false", "true", 0, 1, null, undefined, ""];
  for (const value of invalidValues) {
    expectError(
      setTaskCompleted(demoTasks, 4, value),
      `completed: ${String(value)}`,
    );
  }
  assert.deepStrictEqual(demoTasks, before);
});

scenario("setTaskCompleted: отсутствующая задача и некорректный id", () => {
  const before = snapshot(demoTasks);
  expectError(setTaskCompleted(demoTasks, 999, true), "id = 999");
  expectError(setTaskCompleted([], 1, false), "пустой список");
  expectError(setTaskCompleted(demoTasks, "4", true), "строковый id");
  expectError(setTaskCompleted(demoTasks, 0, true), "id = 0");
  assert.deepStrictEqual(demoTasks, before);
});

// --- Задание 4: renameTask ---

scenario("renameTask: переименование с нормализацией", () => {
  const before = snapshot(demoTasks);
  const originalTask = demoTasks[3];
  const result = renameTask(demoTasks, 10, "   Подготовить инструкцию запуска   ");
  assert.equal(result.ok, true);
  assert.notStrictEqual(result.tasks, demoTasks);
  const updatedTask = result.tasks[3];
  assert.equal(updatedTask.title, "Подготовить инструкцию запуска");
  assert.equal(updatedTask.id, 10);
  assert.equal(updatedTask.completed, true);
  assert.equal(updatedTask.priority, "medium");
  assert.notStrictEqual(updatedTask, originalTask);
  assert.deepStrictEqual(demoTasks, before);
});

scenario("renameTask: некорректное название", () => {
  const before = snapshot(demoTasks);
  expectError(renameTask(demoTasks, 10, ""), "пустая строка");
  expectError(renameTask(demoTasks, 10, "   "), "строка из пробелов");
  expectError(renameTask(demoTasks, 10, "a".repeat(101)), "101 символ");
  expectError(renameTask(demoTasks, 10, 42), "число");
  expectError(renameTask(demoTasks, 10, null), "null");
  assert.deepStrictEqual(demoTasks, before);
});

scenario("renameTask: отсутствующая задача", () => {
  const before = snapshot(demoTasks);
  expectError(renameTask(demoTasks, 999, "Новое имя"), "id = 999");
  expectError(renameTask([], 1, "Новое имя"), "пустой список");
  assert.deepStrictEqual(demoTasks, before);
});

scenario("renameTask: некорректный идентификатор", () => {
  expectError(renameTask(demoTasks, "10", "Новое имя"), "строковый id");
  expectError(renameTask(demoTasks, -5, "Новое имя"), "отрицательный id");
  expectError(renameTask(demoTasks, 1.5, "Новое имя"), "дробный id");
});

// --- Задание 4: removeTask ---

scenario("removeTask: удаление из общего набора", () => {
  const before = snapshot(demoTasks);
  const result = removeTask(demoTasks, 7);
  assert.equal(result.ok, true);
  assert.notStrictEqual(result.tasks, demoTasks);
  assert.deepStrictEqual(result.tasks.map((task) => task.id), [1, 4, 10]);
  assert.deepStrictEqual(demoTasks, before);
});

scenario("removeTask: удаление единственной задачи", () => {
  const single = [{ id: 3, title: "Одна", completed: false, priority: "low" }];
  const result = removeTask(single, 3);
  assert.equal(result.ok, true);
  assert.deepStrictEqual(result.tasks, []);
  assert.strictEqual(single.length, 1);
});

scenario("removeTask: отсутствующая задача и пустой список", () => {
  const before = snapshot(demoTasks);
  expectError(removeTask(demoTasks, 999), "id = 999");
  expectError(removeTask([], 1), "пустой список");
  expectError(removeTask(demoTasks, "7"), "строковый id");
  assert.deepStrictEqual(demoTasks, before);
});

// --- Повторные операции и неизменность входных данных ---

scenario("повторная установка текущих статуса и названия", () => {
  const sameStatus = setTaskCompleted(demoTasks, 4, false);
  assert.equal(sameStatus.ok, true);
  assert.notStrictEqual(sameStatus.tasks, demoTasks);
  assert.notStrictEqual(sameStatus.tasks[1], demoTasks[1]);

  const sameTitle = renameTask(demoTasks, 10, "Оформить README");
  assert.equal(sameTitle.ok, true);
  assert.notStrictEqual(sameTitle.tasks, demoTasks);
  assert.notStrictEqual(sameTitle.tasks[3], demoTasks[3]);
  assert.deepStrictEqual(sameTitle.tasks[3], demoTasks[3]);
});

scenario("неизменность входного массива и объектов", () => {
  const before = snapshot(demoTasks);

  const added = addTask(demoTasks, 30, "Через spread", "low");
  assert.equal(added.ok, true);
  const completed = setTaskCompleted(added.tasks, 4, true);
  assert.equal(completed.ok, true);
  const renamed = renameTask(completed.tasks, 10, "Новое имя README");
  assert.equal(renamed.ok, true);
  const removed = removeTask(renamed.tasks, 7);
  assert.equal(removed.ok, true);

  expectError(addTask(demoTasks, 4, "Дубликат", "low"), "дубликат");
  expectError(setTaskCompleted(demoTasks, 999, true), "отсутствующая задача");
  expectError(renameTask(demoTasks, 999, "X"), "отсутствующая задача");
  expectError(removeTask(demoTasks, 999), "отсутствующая задача");

  assert.deepStrictEqual(demoTasks, before);
  assert.notStrictEqual(added.tasks, demoTasks);
  assert.notStrictEqual(completed.tasks, added.tasks);
  assert.notStrictEqual(renamed.tasks, completed.tasks);
  assert.notStrictEqual(removed.tasks, renamed.tasks);
  assert.strictEqual(demoTasks[1].completed, false);
  assert.strictEqual(demoTasks[3].title, "Оформить README");
});

console.log(`\nИтого: OK ${passedCount}, FAIL ${failedCount}`);
