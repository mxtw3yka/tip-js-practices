import { demoTasks, variantTasks, variantNumber } from "./data.js";
import {
  addTask,
  findTaskById,
  removeTask,
  setTaskCompleted,
  updateTask,
} from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderEmptyState, renderSummary, renderTaskList } from "./task-view.js";
import { validateTaskDraft } from "./form-validation.js";
import { loadTasks, removeSavedTasks, saveTasks } from "./task-storage.js";

const elements = {
  list: document.querySelector("#task-list"),
  filters: document.querySelector("#task-filters"),
  summary: document.querySelector("#task-summary"),
  empty: document.querySelector("#empty-message"),
  message: document.querySelector("#operation-message"),
  datasetLabel: document.querySelector("#dataset-label"),
  storageStatus: document.querySelector("#storage-status"),
  form: document.querySelector("#task-form"),
  formHeading: document.querySelector("#form-heading"),
  formMode: document.querySelector("#form-mode"),
  formMessage: document.querySelector("#form-message"),
  idInput: document.querySelector("#task-id"),
  titleInput: document.querySelector("#task-title"),
  priorityInput: document.querySelector("#task-priority"),
  submitButton: document.querySelector("#form-submit"),
  cancelButton: document.querySelector("#cancel-edit"),
  resetButton: document.querySelector("#reset-data"),
};

const params = new URLSearchParams(window.location.search);
const isVariant = params.get("dataset") === "variant";
const isCheckRun = params.get("mode") === "check";
const initialTasks = isVariant ? variantTasks : demoTasks;
const datasetName = isVariant ? "variant" : "demo";
const storageKey = isCheckRun
  ? `tip-js-practice-04:checks:${datasetName}`
  : `tip-js-practice-04:${datasetName}`;

// Готовая граница запуска: даже незавершённый или ошибочный модуль хранилища
// не должен оставлять страницу без диагностического сообщения.
let loaded;
try {
  loaded = loadTasks(window.localStorage, storageKey, initialTasks);
} catch (error) {
  loaded = {
    ok: false,
    source: "fallback",
    tasks: initialTasks.map((task) => ({ ...task })),
    error: `Хранилище не инициализировано: ${error.message}`,
  };
  console.error(error);
}
let currentTasks = loaded.tasks;
let currentFilter = "all";
let editingId = null;

elements.datasetLabel.textContent = isVariant
  ? `Индивидуальный вариант: ${variantNumber ?? "не указан"}`
  : "Общий контрольный набор";

if (loaded.source === "storage") {
  elements.storageStatus.textContent = "Данные восстановлены из localStorage.";
} else if (loaded.ok) {
  elements.storageStatus.textContent = "Используется исходный набор; сохранённых данных пока нет.";
} else {
  elements.storageStatus.textContent = loaded.error;
  elements.storageStatus.classList.add("is-warning");
}

// Отрисовка только отражает текущее состояние: чтение и запись localStorage
// здесь не выполняются, повторный вызов не создаёт побочных эффектов.
function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);
  renderTaskList(elements.list, visibleTasks);
  renderSummary(elements.summary, currentTasks, visibleTasks.length);
  renderEmptyState(elements.empty, currentTasks.length, visibleTasks.length);
  for (const button of elements.filters.querySelectorAll("button[data-filter]")) {
    const active = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

function clearFieldError(name) {
  const input = elements.form.elements.namedItem(name);
  const message = elements.form.querySelector(`[data-error-for="${name}"]`);
  if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
    input.setCustomValidity("");
    input.removeAttribute("aria-invalid");
  }
  if (message) message.textContent = "";
}

function clearFormErrors() {
  for (const name of ["id", "title", "priority"]) clearFieldError(name);
  elements.formMessage.textContent = "";
}

function showFormErrors(errors) {
  clearFormErrors();
  for (const [name, text] of Object.entries(errors)) {
    const input = elements.form.elements.namedItem(name);
    const message = elements.form.querySelector(`[data-error-for="${name}"]`);
    if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
      input.setCustomValidity(text);
      input.setAttribute("aria-invalid", "true");
    }
    if (message) message.textContent = text;
  }
  elements.form.reportValidity();
}

// Одна форма в двух режимах: editingId === null — создание,
// editingId === id — редактирование. Режим в localStorage не сохраняется.
function setFormMode(id = null) {
  if (id === null || id === undefined) {
    editingId = null;
    elements.form.reset();
    clearFormErrors();
    elements.idInput.disabled = false;
    elements.formHeading.textContent = "Добавление задачи";
    elements.formMode.textContent = "Режим создания новой задачи.";
    elements.submitButton.textContent = "Добавить задачу";
    elements.cancelButton.hidden = true;
    elements.idInput.focus();
    return true;
  }

  const task = findTaskById(currentTasks, id);
  if (!task) {
    elements.formMessage.textContent = `Задача с id=${id} не найдена: режим редактирования не включён.`;
    return false;
  }

  editingId = id;
  clearFormErrors();
  elements.idInput.value = String(task.id);
  elements.titleInput.value = task.title;
  elements.priorityInput.value = task.priority;
  elements.idInput.disabled = true;
  elements.formHeading.textContent = "Редактирование задачи";
  elements.formMode.textContent = `Режим редактирования задачи id = ${task.id}.`;
  elements.submitButton.textContent = "Сохранить изменения";
  elements.cancelButton.hidden = false;
  elements.titleInput.focus();
  return true;
}

// Сохранение выполняется только после успешной операции над моделью.
function persistCurrentTasks(successMessage) {
  const saved = saveTasks(window.localStorage, storageKey, currentTasks);
  elements.storageStatus.classList.toggle("is-warning", !saved.ok);
  elements.storageStatus.textContent = saved.ok
    ? "Изменения сохранены в localStorage."
    : saved.error;
  elements.message.textContent = saved.ok ? successMessage : `${successMessage} ${saved.error}`;
  renderApp();
  return saved;
}

// Готовая вспомогательная функция из логики ПР3. После полной перерисовки
// возвращает фокус на действие той же задачи либо на активный фильтр.
function restoreTaskFocus(id, action) {
  const actionButton = elements.list.querySelector(
    `[data-task-id="${id}"] button[data-action="${action}"]`,
  );
  const filterButton = elements.filters.querySelector(`[data-filter="${currentFilter}"]`);
  (actionButton ?? filterButton)?.focus();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(elements.form);
  const draft = {
    id: formData.get("id"),
    title: formData.get("title"),
    priority: formData.get("priority"),
  };

  const validation = validateTaskDraft(draft, currentTasks, editingId);
  if (!validation.ok) {
    showFormErrors(validation.errors);
    return;
  }

  const { id, title, priority } = validation.value;
  const isEditing = editingId !== null;
  const result = isEditing
    ? updateTask(currentTasks, id, title, priority)
    : addTask(currentTasks, id, title, priority);

  if (!result.ok) {
    elements.formMessage.textContent = result.error;
    return;
  }

  currentTasks = result.tasks;
  setFormMode(null);
  persistCurrentTasks(isEditing
    ? `Задача id = ${id} обновлена.`
    : `Задача id = ${id} добавлена.`);
}

function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-action]");
  if (!button || !elements.list.contains(button)) return;

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "edit" && action !== "delete") return;

  const card = button.closest("li[data-task-id]");
  if (!card) return;

  const id = Number(card.dataset.taskId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    elements.message.textContent = "Некорректный идентификатор задачи";
    return;
  }

  // Редактирование только заполняет форму: данные и хранилище не меняются.
  if (action === "edit") {
    setFormMode(id);
    return;
  }

  if (action === "toggle") {
    const task = findTaskById(currentTasks, id);
    if (!task) {
      elements.message.textContent = `Задача с id=${id} не найдена`;
      return;
    }
    const result = setTaskCompleted(currentTasks, id, task.completed !== true);
    if (!result.ok) {
      elements.message.textContent = result.error;
      return;
    }
    currentTasks = result.tasks;
    persistCurrentTasks(`Статус задачи id = ${id} изменён.`);
    restoreTaskFocus(id, "toggle");
    return;
  }

  const result = removeTask(currentTasks, id);
  if (!result.ok) {
    elements.message.textContent = result.error;
    return;
  }
  currentTasks = result.tasks;
  if (editingId === id) setFormMode(null);
  persistCurrentTasks(`Задача id = ${id} удалена.`);
  restoreTaskFocus(id, "delete");
}

function handleFilterClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-filter]");
  if (!button || !elements.filters.contains(button)) return;

  const filter = button.dataset.filter;
  if (filter !== "all" && filter !== "pending" && filter !== "completed") return;

  // Только режим отображения: модель и хранилище не затрагиваются.
  currentFilter = filter;
  elements.message.textContent = "";
  renderApp();
}

function handleResetClick() {
  const removal = removeSavedTasks(window.localStorage, storageKey);

  currentTasks = initialTasks.map((task) => ({ ...task }));
  currentFilter = "all";
  setFormMode(null);

  elements.storageStatus.classList.toggle("is-warning", !removal.ok);
  if (removal.ok) {
    elements.storageStatus.textContent =
      "Сохранённые данные удалены; используется исходный набор.";
    elements.message.textContent = "Данные сброшены к исходному набору.";
  } else {
    elements.storageStatus.textContent = removal.error;
    elements.message.textContent = `Список восстановлен, но ключ удалить не удалось: ${removal.error}`;
  }
  // Исходный набор после удаления ключа повторно не сохраняется.
  renderApp();
}

// Расширение «Вариант Б»: синхронизация двух вкладок одного origin.
// Событие storage приходит только из другой вкладки; собственная запись
// локальную отрисовку не заменяет.
window.addEventListener("storage", (event) => {
  if (event.key !== null && event.key !== storageKey) return;

  const actualized = loadTasks(window.localStorage, storageKey, initialTasks);
  if (!actualized.ok) {
    elements.storageStatus.classList.add("is-warning");
    elements.storageStatus.textContent = `Данные из другой вкладки не использованы: ${actualized.error}`;
    elements.message.textContent =
      "Список не изменён: запись в хранилище повреждена.";
    return;
  }

  currentTasks = actualized.tasks;
  if (editingId !== null && findTaskById(currentTasks, editingId) === undefined) {
    setFormMode(null);
  }

  elements.storageStatus.classList.remove("is-warning");
  if (actualized.source === "initial") {
    elements.storageStatus.textContent =
      "Сохранённые данные удалены в другой вкладке; используется исходный набор.";
    elements.message.textContent = "Список обновлён: в другой вкладке выполнен сброс.";
  } else {
    elements.storageStatus.textContent = "Данные обновлены из другой вкладки.";
    elements.message.textContent = "Список обновлён по событию storage из другой вкладки.";
  }
  renderApp();
});

elements.form.addEventListener("submit", handleFormSubmit);
elements.form.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
    clearFieldError(event.target.name);
  }
});
elements.list.addEventListener("click", handleTaskListClick);
elements.filters.addEventListener("click", handleFilterClick);
elements.cancelButton.addEventListener("click", () => setFormMode());
elements.resetButton.addEventListener("click", handleResetClick);

try {
  setFormMode();
  renderApp();
} catch (error) {
  elements.message.textContent = `Ошибка запуска: ${error.message}`;
  console.error(error);
}
