"use strict";

const totalTasks = 20;
const completedTasks = 11;
const dailyLimit = 6;

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
    console.log('Ошибка: некорректное число выполненных задач');
} else if (typeof dailyLimit !== 'number') {
    console.log('Ошибка: дневная норма задана строкой');
} else if (Number.isNaN(dailyLimit)) {
    console.log('Ошибка: недопустимая дневная норма');
} else if (!Number.isInteger(dailyLimit)) {
    console.log('Ошибка: дробной дневной нормы быть не должно');
} else if (dailyLimit < 1) {
    console.log('Ошибка: дневная норма должна быть не меньше 1');
} else if (dailyLimit > 1000) {
    console.log('Ошибка: превышена верхняя граница нормы');
} else {
    if (totalTasks === 0 && completedTasks === 0) {
        console.log('Задач пока нет');
        console.log('Потребуется дней: 0');
    } else if (completedTasks === totalTasks) {
        console.log('Все задачи уже выполнены');
        console.log('Потребуется дней: 0');
    } else {
        let remaining = totalTasks - completedTasks;
        let days = 0;

        console.log(`Осталось задач: ${remaining}`);
        while (remaining > 0) {
            days++;
            const doneToday = Math.min(dailyLimit, remaining);
            remaining = remaining - doneToday;
            console.log(`День ${days}: выполнено ${doneToday}, осталось ${remaining}`);
        }
        console.log(`Потребуется дней: ${days}`);
    }
}