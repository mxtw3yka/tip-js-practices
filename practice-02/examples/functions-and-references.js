// Эксперимент 1: вызов sum с числами и со строкой
console.log("=== Эксперимент 1: sum с числами и строками ===");

function sum(a, b) {
  return a + b;
}

console.log(sum(2, 3), typeof sum(2, 3));
console.log(sum("2", "3"), typeof sum("2", "3"));
console.log(sum(2, "3"), typeof sum(2, "3"));

// Эксперимент 2: стрелочная функция с телом в фигурных скобках
console.log("=== Эксперимент 2: стрелочная функция с фигурными скобками ===");

const square = (value) => {
  value * value;
};

console.log(square(4), typeof square(4));

// Эксперимент 3: присваивание объекта второй переменной
console.log("=== Эксперимент 3: ссылка на объект ===");

const original = { title: "Черновик", published: false };
const alias = original;

alias.published = true;

console.log(original === alias);
console.log(original.published, alias.published);
console.log(original.title, alias.title);

// Эксперимент 4: копирование массива объектов через spread
console.log("=== Эксперимент 4: копирование массива объектов ===");

const sourceItems = [
  { id: 1, title: "Первая" },
  { id: 2, title: "Вторая" },
];
const copiedItems = [...sourceItems];

console.log(copiedItems !== sourceItems);
console.log(copiedItems[0] === sourceItems[0]);

copiedItems[0].title = "Изменено";
console.log(sourceItems[0].title, copiedItems[0].title);

copiedItems[1] = { id: 3, title: "Замена" };
console.log(sourceItems[1].title, copiedItems[1].title);

// Эксперимент 5: spread объекта и повторное указание свойства
console.log("=== Эксперимент 5: spread объекта и порядок свойств ===");

const oldBook = { id: 12, title: "Черновик", available: false };
const newBook = { ...oldBook, available: true };
const overriddenBook = { available: true, ...oldBook };

console.log(newBook.available, oldBook.available);
console.log(newBook === oldBook);
console.log(overriddenBook.available);

// Эксперимент 6: параметр по умолчанию
console.log("=== Эксперимент 6: параметр по умолчанию ===");

function makeCaption(text = "Без названия") {
  return text;
}

console.log(JSON.stringify(makeCaption()));
console.log(JSON.stringify(makeCaption(undefined)));
console.log(JSON.stringify(makeCaption(null)));
console.log(JSON.stringify(makeCaption("")));
