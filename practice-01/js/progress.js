"use strict";

const totalTasks = 20;
const completedTasks = 11;

if (typeof totalTasks !== 'number' || typeof completedTasks !== 'number') {
    console.log('Ошибка: вместо числа передана строка');
} else if (Number.isNaN(totalTasks) || Number.isNaN(completedTasks)) {
    console.log('Ошибка: недопустимое числовое значение');
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
    console.log('Ошибка: дробное количество');
} else if (totalTasks < 0 || completedTasks < 0) {
    console.log('Ошибка: отрицательное количество');
} else if (totalTasks > 1000) {
    console.log('Ошибка: превышена верхняя граница');
} else if (completedTasks > totalTasks) {
    console.log('Ошибка: выполнено больше, чем существует');
} else if (totalTasks === 0 && completedTasks === 0) {
    console.log('Задач пока нет');
} else {
    const uncompletedTasks = totalTasks - completedTasks;
    const percent = (completedTasks / totalTasks * 100).toFixed(1);

    let status = 'Статус: В работе';
    if (completedTasks === 0) {
        status = 'Статус: Не начато';
    } else if (completedTasks === totalTasks) {
        status = 'Статус: Завершено';
    }

    console.log(`Всего задач: ${totalTasks}`);
    console.log(`Выполнено: ${completedTasks}`);
    console.log(`Осталось: ${uncompletedTasks}`);
    console.log(`Прогресс: ${percent}%`);
    console.log(status);
}