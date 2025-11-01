const API = '/todos';
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

let todos = [];
let currentFilter = 'all';

// Load todos
async function loadTodos() {
  try {
    const res = await fetch(API);
    const todosData = await res.json();
    todos = todosData;
    render();
  } catch (error) {
    console.error('Error loading todos:', error);
  }
}

// Render todos based on filter
function render() {
  const filteredTodos = filterTodos();
  
  todoList.innerHTML = '';
  
  filteredTodos.forEach(todo => {
    const li = createTodoElement(todo);
    todoList.appendChild(li);
  });
}

function filterTodos() {
  switch (currentFilter) {
    case 'completed':
      return todos.filter(todo => todo.status);
    case 'pending':
      return todos.filter(todo => !todo.status);
    default:
      return todos;
  }
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item';
  if (todo.status) li.classList.add('completed');

  // Task text
  const taskSpan = document.createElement('span');
  taskSpan.className = `task-text ${todo.status ? 'completed' : ''}`;
  taskSpan.textContent = todo.task;

  // Actions container
  const actions = document.createElement('div');
  actions.className = 'actions';

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.innerHTML = 'Edit ☺';
  editBtn.className = 'edit';
  editBtn.onclick = () => enableEdit(taskSpan, todo.id);

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.innerHTML = 'Delete ☷';
  delBtn.className = 'delete';
  delBtn.onclick = () => deleteTodo(todo.id);

  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = todo.status ? 'Set as undone ✓' : 'Set as done ✓';
  toggleBtn.className = 'toggle';
  toggleBtn.onclick = () => toggleStatus(todo.id, todo.status);

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  actions.appendChild(toggleBtn);

  li.appendChild(taskSpan);
  li.appendChild(actions);
  
  return li;
}

// Enable edit mode
function enableEdit(spanElement, todoId) {
  const currentText = spanElement.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.className = 'edit-input';
  
  spanElement.replaceWith(input);
  input.focus();

  const saveEdit = async () => {
    const newText = input.value.trim();
    if (newText && newText !== currentText) {
      try {
        await fetch(`${API}/${todoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: newText })
        });
        await loadTodos();
      } catch (error) {
        alert('Error updating task');
      }
    } else {
      input.replaceWith(createTaskSpan(currentText));
    }
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveEdit();
  });
}

function createTaskSpan(text) {
  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = text;
  return span;
}

// Add new todo
addBtn.addEventListener('click', async () => {
  const task = taskInput.value.trim();
  if (!task) return alert('Please enter a task!');
  
  try {
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task })
    });
    taskInput.value = '';
    await loadTodos();
  } catch (error) {
    alert('Error adding task');
  }
});

// Toggle status
async function toggleStatus(id, current) {
  try {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: current ? 0 : 1 })
    });
    await loadTodos();
  } catch (error) {
    alert('Error updating status');
  }
}

// Delete todo
async function deleteTodo(id) {
  if (!confirm('Delete this task?')) return;
  
  try {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    await loadTodos();
  } catch (error) {
    alert('Error deleting task');
  }
}

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Initialize
loadTodos();