const API_URL = "http://localhost:5000/tasks";
let currentFilter = "all";
let selectedTask = null;
let isEditing = false;

// Fetch and display tasks
async function getTasks() {
  try {
    const response = await fetch(API_URL);
    const tasks = await response.json();

    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    // FILTER LOGIC ADDED HERE
    const filteredTasks = tasks.filter(task => {
      if (currentFilter === "all") return true;
      return task.status === currentFilter;
    });

    if (filteredTasks.length === 0) {
      taskList.innerHTML = `
        <div class="no-tasks">
          No tasks found
        </div>
    `;
    return;
  }

    // USE filteredTasks INSTEAD OF tasks
    filteredTasks.forEach(task => {
      const div = document.createElement("div");
      div.classList.add("task");

      div.dataset.id = task.id;

      div.addEventListener("click", (e) => {
        if (isEditing) return;
        openDetail(task);
      });

      div.innerHTML = `
        <div class="task-card">
          <div class="task-header">
            <h3>${task.title}</h3>
            <span class="priority ${task.priority.toLowerCase()}"></span>
          </div>

          <p class="status">${task.status}</p>
          <p class="date">${task.due_date.split('T')[0]}</p>
        </div>
    `;

      taskList.appendChild(div);
    });

  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

getTasks();

// Add task function
async function addTask() {
  try {
    const title = document.getElementById("title").value;
    const priority = document.getElementById("priority").value;
    const due_date = document.getElementById("due_date").value;

    const response = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        priority,
        due_date
      })
    });

    const newTask = await response.json();

    console.log("Task added:", newTask);

    closeModal();

    // Clear input fields
    document.getElementById("title").value = "";
    document.getElementById("due_date").value = "";

    // Refresh task list
    getTasks();

  } catch (error) {
    console.error("Error adding task:", error);
  }
}

// Delete task function
async function deleteTask(id) {
  try {
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "DELETE"
    });

    isEditing = false;
    // Refresh task list
    getTasks();

  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

// Enable edit mode for a task
function enableEdit(id, title, priority, status, due_date) {

  isEditing = true;
  const taskDiv = document.querySelector(`[data-id="${id}"]`);
  

  if (!taskDiv) {
    console.error("Task element not found");
    return;
  }

  taskDiv.innerHTML = `
    <input type="text" id="edit-title-${id}" value="${title || ''}" />

    <select id="edit-priority-${id}">
      <option value="High" ${priority === "High" ? "selected" : ""}>High</option>
      <option value="Medium" ${priority === "Medium" ? "selected" : ""}>Medium</option>
      <option value="Low" ${priority === "Low" ? "selected" : ""}>Low</option>
    </select>

    <select id="edit-status-${id}">
      <option value="pending" ${status === "pending" ? "selected" : ""}>pending</option>
      <option value="completed" ${status === "completed" ? "selected" : ""}>completed</option>
    </select>

    <input type="date" id="edit-date-${id}" value="${due_date.split('T')[0]}" />

    <button onclick="event.stopPropagation(); saveEdit(${id})">Save</button>
  `;
}

// Save edited task function
async function saveEdit(id) {
  const title = document.getElementById(`edit-title-${id}`).value;
  const priority = document.getElementById(`edit-priority-${id}`).value;
  const status = document.getElementById(`edit-status-${id}`).value;
  const due_date = document.getElementById(`edit-date-${id}`).value;

  try {
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        priority,
        status,
        due_date
      })
    });

    isEditing = false;

    getTasks(); // reload UI

  } catch (error) {
    console.error("Error updating task:", error);
  }
}

// Filter tasks function
function filterTasks(filter) {
  currentFilter = filter;
  getTasks();
}

function openModal() {
  document.getElementById("taskModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("taskModal").style.display = "none";
}

function openDetail(task) {
  selectedTask = task;

  document.getElementById("detailTitle").innerText = task.title;
  document.getElementById("detailPriority").innerText = task.priority;
  document.getElementById("detailStatus").innerText = task.status;
  document.getElementById("detailDate").innerText = task.due_date.split('T')[0];

  document.getElementById("detailModal").style.display = "flex";
}

function closeDetailModal() {
  document.getElementById("detailModal").style.display = "none";
}

function deleteFromDetail() {
  if (selectedTask) {
    deleteTask(selectedTask.id);
    closeDetailModal();
  }
}

function enableEditFromDetail(e) {
  if (e) e.stopPropagation();

  isEditing = true; // IMPORTANT

  if (!selectedTask) return;

  closeDetailModal();

  enableEdit(
    selectedTask.id,
    selectedTask.title,
    selectedTask.priority,
    selectedTask.status,
    selectedTask.due_date
  );
}