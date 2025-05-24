document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
  
    const addTaskBtn = document.getElementById('addTaskBtn');
    addTaskBtn.addEventListener('click', addTask);
  });
  
  function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    if (taskText === '') return;
  
    const tasks = getTasksFromStorage();
    tasks.push({ text: taskText, completed: false });
    saveTasksToStorage(tasks);
  
    renderTasks();
    input.value = '';
  }
  
  function deleteTask(index) {
    const tasks = getTasksFromStorage();
    tasks.splice(index, 1);
    saveTasksToStorage(tasks);
    renderTasks();
  }
  
  function toggleTask(index) {
    const tasks = getTasksFromStorage();
    tasks[index].completed = !tasks[index].completed;
    saveTasksToStorage(tasks);
    renderTasks();
  }
  
  function getTasksFromStorage() {
    const tasksJSON = localStorage.getItem('tasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
  }
  
  function saveTasksToStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
  
    const tasks = getTasksFromStorage();
  
    tasks.forEach((task, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'task-item';
      listItem.setAttribute('draggable', 'true');
      listItem.dataset.index = index;
  
      listItem.addEventListener('dragstart', handleDragStart);
      listItem.addEventListener('dragover', handleDragOver);
      listItem.addEventListener('drop', handleDrop);
      listItem.addEventListener('dragend', handleDragEnd);
  
      const taskLeft = document.createElement('div');
      taskLeft.className = 'task-left';
  
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => toggleTask(index));
  
      const taskTextDiv = document.createElement('div');
      taskTextDiv.className = 'task-text';
      taskTextDiv.textContent = task.text;
  
      if (task.completed) {
        taskTextDiv.style.textDecoration = 'line-through';
        taskTextDiv.style.opacity = '0.6';
      } else {
        taskTextDiv.style.textDecoration = 'none';
        taskTextDiv.style.opacity = '1';
      }
  
      taskLeft.appendChild(checkbox);
      taskLeft.appendChild(taskTextDiv);
  
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-delete';
      deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
      deleteBtn.onclick = () => deleteTask(index);
  
      listItem.appendChild(taskLeft);
      listItem.appendChild(deleteBtn);
  
      taskList.appendChild(listItem);
    });
  }
  
  function loadTasks() {
    renderTasks();
  }

  let draggedIndex = null;

function handleDragStart(e) {
  draggedIndex = +this.dataset.index;
  this.classList.add('dragging');
}

function handleDragOver(e) {
  e.preventDefault(); 
}

function handleDrop(e) {
  const targetIndex = +this.dataset.index;
  if (draggedIndex === null || draggedIndex === targetIndex) return;

  const tasks = getTasksFromStorage();
  const draggedItem = tasks[draggedIndex];
  tasks.splice(draggedIndex, 1);         
  tasks.splice(targetIndex, 0, draggedItem);

  saveTasksToStorage(tasks);
  renderTasks();
}

function handleDragEnd() {
  draggedIndex = null;
  document.querySelectorAll('.task-item').forEach(item => item.classList.remove('dragging'));
}

  