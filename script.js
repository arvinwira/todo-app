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
    tasks.active.push({ text: taskText, completed: false });
    saveTasksToStorage(tasks);
  
    renderTasks();
    input.value = '';
  }
  
  function deleteTask(index, isCompleted = false) {
    const tasks = getTasksFromStorage();
    const taskList = isCompleted ? tasks.completed : tasks.active;
    taskList.splice(index, 1);
    saveTasksToStorage(tasks);
    renderTasks();
  }
  
  function toggleTask(index, isCompleted = false) {
    const tasks = getTasksFromStorage();
    const sourceList = isCompleted ? tasks.completed : tasks.active;
    const targetList = isCompleted ? tasks.active : tasks.completed;
    const task = sourceList[index];
    
    const taskElement = document.querySelector(
      `${isCompleted ? '#completedTaskList' : '#taskList'} li[data-index="${index}"]`
    );
  
    taskElement.classList.add('completing');
  
    setTimeout(() => {
      sourceList.splice(index, 1);
      targetList.push({ ...task, completed: !isCompleted });
      saveTasksToStorage(tasks);
      renderTasks();
    }, 300);
  }
  
  function getTasksFromStorage() {
    const tasksJSON = localStorage.getItem('tasks');
    if (!tasksJSON) return { active: [], completed: [] };
    
    const parsedTasks = JSON.parse(tasksJSON);
    
    if (Array.isArray(parsedTasks)) {
        const migratedTasks = {
            active: parsedTasks.filter(task => !task.completed),
            completed: parsedTasks.filter(task => task.completed)
        };
        saveTasksToStorage(migratedTasks);
        return migratedTasks;
    }
    
    return parsedTasks;
  }
  
  function saveTasksToStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  function renderTasks() {
    const activeTaskList = document.getElementById('taskList');
    const completedTaskList = document.getElementById('completedTaskList');
    activeTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';
  
    const tasks = getTasksFromStorage();
  
    tasks.active.forEach((task, index) => {
      const listItem = createTaskElement(task, index, false);
      activeTaskList.appendChild(listItem);
    });

    tasks.completed.forEach((task, index) => {
      const listItem = createTaskElement(task, index, true);
      listItem.classList.add('appearing');
      completedTaskList.appendChild(listItem);
    });
  }

  function createTaskElement(task, index, isCompleted) {
    const listItem = document.createElement('li');
    listItem.className = 'task-item';
    listItem.setAttribute('draggable', !isCompleted);
    listItem.dataset.index = index;
  
    if (!isCompleted) {
      listItem.addEventListener('dragstart', handleDragStart);
      listItem.addEventListener('dragover', handleDragOver);
      listItem.addEventListener('drop', handleDrop);
      listItem.addEventListener('dragend', handleDragEnd);
    }
  
    const taskLeft = document.createElement('div');
    taskLeft.className = 'task-left';
  
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isCompleted;
    
    checkbox.addEventListener('change', (e) => {
      const taskTextDiv = e.target.parentElement.querySelector('.task-text');
      if (!isCompleted) {
        taskTextDiv.classList.add('completed');
      } else {
        taskTextDiv.classList.remove('completed');
      }
      setTimeout(() => toggleTask(index, isCompleted), 150);
    });
  
    const taskTextDiv = document.createElement('div');
    taskTextDiv.className = 'task-text';
    if (isCompleted) {
      taskTextDiv.classList.add('completed');
    }
    taskTextDiv.textContent = task.text;
  
    taskLeft.appendChild(checkbox);
    taskLeft.appendChild(taskTextDiv);
  
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.onclick = () => deleteTask(index, isCompleted);
  
    listItem.appendChild(taskLeft);
    listItem.appendChild(deleteBtn);
  
    return listItem;
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
    const draggedItem = tasks.active[draggedIndex];
    tasks.active.splice(draggedIndex, 1);         
    tasks.active.splice(targetIndex, 0, draggedItem);

    saveTasksToStorage(tasks);
    renderTasks();
  }

  function handleDragEnd() {
    draggedIndex = null;
    document.querySelectorAll('.task-item').forEach(item => item.classList.remove('dragging'));
  }
  