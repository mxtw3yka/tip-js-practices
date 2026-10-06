import { getTaskStats } from "./task-service.js";

const PRIORITY_LABELS = { low: "Низкий", medium: "Средний", high: "Высокий" };

function createActionButton(action, label, pressed) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  if (typeof pressed === "boolean") {
    button.setAttribute("aria-pressed", String(pressed));
  }
  const span = document.createElement("span");
  span.className = "action-label";
  span.textContent = label;
  button.append(span);
  return button;
}

// Карточка задачи. Здесь создаётся DOM, но не изменяется состояние приложения.
// ПР4: добавлено третье действие edit; обработчики по-прежнему не назначаются.
export function createTaskElement(task) {
  const card = document.createElement("li");
  card.className = "task-card";
  card.dataset.taskId = String(task.id);
  if (task.completed === true) {
    card.classList.add("is-completed");
  }

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;
  card.append(title);

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed === true ? "Выполнена" : "В работе";
  card.append(status);

  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = PRIORITY_LABELS[task.priority] ?? task.priority;
  card.append(priority);

  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(createActionButton("toggle", "Выполнена", task.completed === true));
  actions.append(createActionButton("edit", "Изменить", null));
  actions.append(createActionButton("delete", "Удалить", null));
  card.append(actions);

  return card;
}

export function renderTaskList(listElement, tasks) {
  listElement.replaceChildren(...tasks.map((task) => createTaskElement(task)));
}

// tasks — ВЕСЬ текущий массив, visibleCount — длина отфильтрованной выборки.
export function renderSummary(summaryElement, tasks, visibleCount) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  summaryElement.querySelector('[data-stat="total"]').textContent = String(total);
  summaryElement.querySelector('[data-stat="completed"]').textContent = String(completed);
  summaryElement.querySelector('[data-stat="pending"]').textContent = String(pending);
  summaryElement.querySelector('[data-stat="progress"]').textContent = `${progress.toFixed(1)}%`;
  summaryElement.querySelector('[data-stat="visible"]').textContent = String(visibleCount);
}

// Различает полностью пустой список и пустой результат фильтра.
export function renderEmptyState(messageElement, total, visibleCount) {
  if (visibleCount === 0) {
    messageElement.hidden = false;
    messageElement.textContent = total === 0
      ? "Список задач пуст."
      : "Нет задач по выбранному фильтру.";
  } else {
    messageElement.hidden = true;
    messageElement.textContent = "";
  }
}