let tasks = [];
let currentFilter = 'all';

const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addTaskBtn');
const taskListEl = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const counterDisplay = document.getElementById('counterDisplay');

function saveToLocalStorage() {
    localStorage.setItem('taskQuestTasks', JSON.stringify(tasks));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('taskQuestTasks');
    if (stored) {
        tasks = JSON.parse(stored);
    } else {
        tasks = [
            { id: Date.now() + 1, text: 'Подготовить описание проекта', category: 'Работа', completed: false },
            { id: Date.now() + 2, text: 'Купить молоко и хлеб', category: 'Личное', completed: true },
            { id: Date.now() + 3, text: 'Прочитать главу по JS', category: 'Учеба', completed: false }
        ];
    }
}

function updateCounter() {
    const activeCount = tasks.filter(task => !task.completed).length;
    counterDisplay.innerText = `Активных: ${activeCount}`;
}

// Переключение статуса
function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id == id);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderTasks();
    }
}

function deleteTaskById(id) {
    tasks = tasks.filter(task => task.id != id);
    saveToLocalStorage();
    renderTasks();
}

function addNewTask() {
    const text = taskInput.value.trim();
    if (text === '') {
        alert('Пожалуйста, напишите задачу!');
        taskInput.focus();
        return;
    }
    const category = categorySelect.value;
    const newTask = {
        id: Date.now(),
        text: text,
        category: category,
        completed: false
    };
    tasks.push(newTask);
    saveToLocalStorage();
    taskInput.value = '';
    taskInput.focus();
    renderTasks();
}

function renderTasks() {
    let filteredTasks = [];
    if (currentFilter === 'all') {
        filteredTasks = tasks;
    } else if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        taskListEl.innerHTML = '<li class="empty-message">Пока нет задач в этой категории</li>';
        updateCounter();
        return;
    }

    const fragment = document.createDocumentFragment();
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-check';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

        const taskTextSpan = document.createElement('span');
        taskTextSpan.className = `task-text ${task.completed ? 'completed' : ''}`;
        taskTextSpan.innerText = task.text;

        const categorySpan = document.createElement('span');
        categorySpan.className = 'task-category';
        categorySpan.innerText = task.category;

        taskInfo.appendChild(checkbox);
        taskInfo.appendChild(taskTextSpan);
        taskInfo.appendChild(categorySpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '✕';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => deleteTaskById(task.id));

        li.appendChild(taskInfo);
        li.appendChild(deleteBtn);
        fragment.appendChild(li);
    });

    taskListEl.innerHTML = '';
    taskListEl.appendChild(fragment);
    updateCounter();
}

function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        const btnFilter = btn.getAttribute('data-filter');
        if (btnFilter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderTasks();
}

function init() {
    loadFromLocalStorage();
    // Миграция: убедимся, что у всех задач есть поле category
    tasks = tasks.map(t => ({ ...t, category: t.category || 'Личное' }));
    saveToLocalStorage();
    currentFilter = 'all';
    filterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === 'all') btn.classList.add('active');
        else btn.classList.remove('active');
    });
    renderTasks();
}

addBtn.addEventListener('click', addNewTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNewTask();
});
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.getAttribute('data-filter'));
    });
});

// Запуск
init();