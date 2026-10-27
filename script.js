
/* ==========================================
   TASKFLOW - TO-DO LIST APPLICATION
   Developer: Asan Ananga Attia
   Arch Technologies Internship
========================================== */

// 1. SELECT HTML ELEMENTS

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

const totalTasks = document.getElementById("total-tasks");
const activeTasks = document.getElementById("active-tasks");
const completedTasks = document.getElementById("completed-tasks");

const filterButtons = document.querySelectorAll(".filter-btn");

// 2. LOAD SAVED TASKS

const STORAGE_KEY = "taskflow-tasks";

function loadTasks() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    } catch (error) {
        console.error("Unable to load saved tasks:", error);
        return [];
    }
}

let tasks = loadTasks();
let currentFilter = "all";

// 3. SAVE TASKS TO BROWSER STORAGE

function saveTasks() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );
    } catch (error) {
        console.error("Unable to save tasks:", error);
        alert("Your tasks could not be saved in this browser.");
    }
}

// 4. ADD A NEW TASK

function addTask(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskForm.reset();
    taskInput.focus();
}

// 5. COMPLETE OR UNCOMPLETE A TASK

function toggleTask(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    task.completed = !task.completed;

    saveTasks();
    renderTasks();
}

// 6. EDIT AN EXISTING TASK

function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    const updatedText = prompt(
        "Edit your task:",
        task.text
    );

    // Cancel was clicked
    if (updatedText === null) {
        return;
    }

    const cleanText = updatedText.trim();

    if (cleanText === "") {
        alert("A task cannot be empty.");
        return;
    }

    if (cleanText.length > 120) {
        alert("A task cannot exceed 120 characters.");
        return;
    }

    task.text = cleanText;

    saveTasks();
    renderTasks();
}

// 7. DELETE A TASK

function deleteTask(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    const confirmed = confirm(
        `Delete this task?\n\n${task.text}`
    );

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(task => task.id !== taskId);

    saveTasks();
    renderTasks();
}

// 8. UPDATE TASK STATISTICS

function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const active = total - completed;

    totalTasks.textContent = total;
    activeTasks.textContent = active;
    completedTasks.textContent = completed;
}

// 9. GET TASKS BASED ON CURRENT FILTER

function getFilteredTasks() {
    if (currentFilter === "active") {
        return tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        return tasks.filter(task => task.completed);
    }

    return tasks;
}

// 10. DISPLAY TASKS ON THE PAGE

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = getFilteredTasks();

    filteredTasks.forEach(task => {

        // Create the list item
        const listItem = document.createElement("li");

        listItem.className = "task-item";

        if (task.completed) {
            listItem.classList.add("completed");
        }

        // Create completion checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as completed`
        );

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        // Create task text
        const taskText = document.createElement("span");

        taskText.className = "task-text";
        taskText.textContent = task.text;

        // Create action container
        const actions = document.createElement("div");

        actions.className = "task-actions";

        // Edit button
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.setAttribute(
            "aria-label",
            `Edit ${task.text}`
        );

        editButton.addEventListener("click", () => {
            editTask(task.id);
        });

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${task.text}`
        );

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        // Assemble task item
        actions.append(editButton, deleteButton);

        listItem.append(
            checkbox,
            taskText,
            actions
        );

        taskList.appendChild(listItem);
    });

    // Display the correct empty message
    if (filteredTasks.length === 0) {
        emptyMessage.style.display = "block";

        if (tasks.length === 0) {
            emptyMessage.textContent =
                "No tasks yet. Add your first task!";
        } else if (currentFilter === "active") {
            emptyMessage.textContent =
                "No active tasks found.";
        } else if (currentFilter === "completed") {
            emptyMessage.textContent =
                "No completed tasks found.";
        } else {
            emptyMessage.textContent =
                "No tasks to display.";
        }
    } else {
        emptyMessage.style.display = "none";
    }

    updateStatistics();
}

// 11. HANDLE FILTER BUTTONS

filterButtons.forEach(button => {
    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(filterButton => {
            const isActive = filterButton === button;

            filterButton.classList.toggle(
                "active",
                isActive
            );

            filterButton.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });

        renderTasks();
    });
});

// 12. CONNECT THE FORM TO THE ADD FUNCTION

taskForm.addEventListener("submit", addTask);

// 13. DISPLAY SAVED TASKS WHEN PAGE LOADS

renderTasks();
