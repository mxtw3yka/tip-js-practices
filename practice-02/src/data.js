// Общий контрольный набор. Для своего варианта ниже предусмотрен отдельный массив.
// Идентификатор задачи не совпадает с её индексом в массиве.
export const demoTasks = [
  { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
  { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
  { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
  { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];

// Вариант 4 «Подготовка семинара».
// K = 3: первые три задачи набора выполнены, прогресс исходно 50.0%.
export const variantNumber = 4;
export const variantTasks = [
  { id: 11, title: "Подготовить темы доклада", completed: true, priority: "high" },
  { id: 23, title: "Собрать материалы с семинара", completed: true, priority: "medium" },
  { id: 37, title: "Составить список участников", completed: true, priority: "low" },
  { id: 41, title: "Подготовить презентацию", completed: false, priority: "high" },
  { id: 58, title: "Распечатать раздаточные материалы", completed: false, priority: "medium" },
  { id: 64, title: "Подготовить помещение", completed: false, priority: "low" },
];