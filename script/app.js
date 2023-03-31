const container = document.querySelector(".container");

function fetch() {
  const tasksData = localStorage.getItem("Kalbonyan");

  if (!tasksData) {
    return [
      {
        id: 1,
        title: "Not Started",
        tasks: [],
      },
      {
        id: 2,
        title: "In Progress",
        tasks: [],
      },
      {
        id: 3,
        title: "Completed",
        tasks: [],
      },
    ];
  }

  return JSON.parse(tasksData);
}

// Create a Task

function createTask(targetColumnId, taskContent) {
  const tasksData = fetch();

  const targetColumn = tasksData.find((column) => column.id == targetColumnId);

  targetColumn.tasks.push({
    id: "" + new Date().getTime(),
    taskContent,
  });

  saveTasks(tasksData);
}

// Delete a Task

function deleteTask(taskId) {
  const tasksData = fetch();

  tasksData.forEach((column) => {
    column.tasks = column.tasks.filter((task) => task.id !== taskId);
  });

  saveTasks(tasksData);
}

// Update a Task

function updateTask(taskId, taskContent) {
  const tasksData = fetch();

  for (const column of tasksData) {
    const task = column.tasks.find((task) => task.id === taskId);

    if (task) {
      task.taskContent = taskContent;
      break;
    }
  }

  saveTasks(tasksData);
}

// change the position of a task

function swapTask(targetColumn, siblingId, dropDirection) {
  const draggedTaskData = {
    id: draggedTask.id,
    taskContent: draggedTask.innerText,
  };

  deleteTask(draggedTask.id);
  const tasksData = fetch();
  const targetTasksObj = tasksData.find((obj) => obj.id == targetColumn.id);

  let targetTaskPosition = targetTasksObj.tasks.findIndex(
    (item) => item.id == siblingId
  );

  if (dropDirection === -1) {
    targetTasksObj.tasks.splice(targetTaskPosition, 0, draggedTaskData);
  } else {
    targetTasksObj.tasks.splice(targetTaskPosition + 1, 0, draggedTaskData);
  }

  saveTasks(tasksData);
}

// Save Tasks

function saveTasks(tasksData) {
  localStorage.setItem("Kalbonyan", JSON.stringify(tasksData));
  render();
}

// Add a task when the 'add' button is clicked
function taskToAdd(addTaskBtn, targetColumnId) {
  addTaskBtn.addEventListener("click", () => {
    const taskInput = document.createElement("div");
    taskInput.className = "task";
    taskInput.contentEditable = "true";
    taskInput.style.cursor = "auto";

    taskInput.addEventListener("blur", function () {
      taskInput.contentEditable = false;
      taskInput.style.cursor = "pointer";

      if (taskInput.textContent !== "") {
        createTask(targetColumnId, taskInput.textContent);
      } else {
        render();
      }
    });

    const tasksList = addTaskBtn.parentElement.querySelector(".tasks");
    tasksList.appendChild(taskInput);
    taskInput.focus();
  });
}

// Delete a task when the delete button is clicked
function deleteHandler() {
  const taskEl = this.parentNode.previousElementSibling;
  const targetTaskId = taskEl.id;
  deleteTask(targetTaskId);
}

// Update a task when the edit button is clicked
function updateHandler() {
  const taskToUpdate = this.parentNode.previousElementSibling;
  const taskId = taskToUpdate.id;
  taskToUpdate.contentEditable = "true";
  taskToUpdate.focus();

  const range = document.createRange();
  range.selectNodeContents(taskToUpdate);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  const originalTaskContent = taskToUpdate.textContent;

  taskToUpdate.addEventListener("blur", function () {
    taskToUpdate.contentEditable = false;
    const updatedTaskContent = taskToUpdate.textContent.trim();

    if (
      updatedTaskContent !== originalTaskContent &&
      updatedTaskContent !== ""
    ) {
      updateTask(taskId, updatedTaskContent);
    } else {
      render();
    }
  });
}

// Add drag and drop events to tasks and drop areas

function dragDropEvents() {
  const tasks = document.querySelectorAll(".task");

  tasks.forEach((task) => {
    task.addEventListener("dragstart", dragStart);
  });

  const dropAreas = document.querySelectorAll(".drop-area");

  dropAreas.forEach((dropArea) => {
    dropArea.addEventListener("dragover", dragOver);
    dropArea.addEventListener("dragenter", dragEnter);
    dropArea.addEventListener("dragleave", dragLeave);
    dropArea.addEventListener("drop", dragDrop);
  });
}

let draggedTask;

function dragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
  draggedTask = this;
  this.style.opacity = "0.5";
}

function dragOver(e) {
  e.preventDefault();
  this.classList.add("drop-area-clack");
}

function dragEnter(e) {
  e.preventDefault();
  this.classList.add("drop-area-active");
}

function dragLeave() {
  this.classList.remove("drop-area-active");
}

function dragDrop(e) {
  e.preventDefault();

  this.classList.remove("drop-area-active");

  const targetColumn = this.closest(".column");

  const sibling = this.nextElementSibling || this.previousElementSibling;
  const siblingId = sibling ? sibling.firstElementChild.id : 0;

  const dropDirection = sibling
    ? sibling === this.nextElementSibling
      ? -1
      : 1
    : 0;

  swapTask(targetColumn, siblingId, dropDirection);
}

function renderTasks(column) {
  let tasksHtml = "";
  // loop through each task in the column and create the corresponding HTML
  column.tasks.forEach((item) => {
    tasksHtml += `
    <div class="drop-area"></div>
      <div class="task-content">
        <div draggable="true" class="task" id="${item.id}" contenteditable="false">${item.taskContent}</div>
        <div class="task-actions">
          <button class="task-edit"><i class="fas fa-edit"></i></button>
          <button class="task-delete"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>

    `;
  });
  // if add a drop area at the bottom of the column
  tasksHtml += `<div class="drop-area"></div>`;

  const tasksEl = document.createElement("div");
  tasksEl.className = "tasks";
  tasksEl.id = "tasks";
  tasksEl.innerHTML = tasksHtml;

  tasksEl.querySelectorAll(".task-edit").forEach((editBtn) => {
    editBtn.addEventListener("click", updateHandler);
  });

  tasksEl.querySelectorAll(".task-delete").forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", deleteHandler);
  });

  return tasksEl;
}

function render() {
  const tasksData = fetch();
  container.innerHTML = "";
  tasksData.forEach((column) => {
    const columnEl = document.createElement("div");
    columnEl.className = "column";

    const columnTitleEl = document.createElement("h2");
    columnEl.id = column.id;
    columnTitleEl.innerText = column.title;
    columnTitleEl.style.textAlign = "center";
    columnEl.appendChild(columnTitleEl);
    const tasksEl = renderTasks(column);
    if (column.id === 3) {
      tasksEl.style.textDecoration = "line-through";
      tasksEl.style.color = "grey";
    }
    columnEl.appendChild(tasksEl);

    const addTaskBtn = document.createElement("button");
    addTaskBtn.className = "add-task";
    addTaskBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add`;
    columnEl.appendChild(addTaskBtn);

    taskToAdd(addTaskBtn, column.id);

    container.appendChild(columnEl);
  });
  dragDropEvents();
}

render();
