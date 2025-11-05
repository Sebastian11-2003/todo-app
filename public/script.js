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

  const taskSpan = document.createElement('span');
  taskSpan.className = `task-text ${todo.status ? 'completed' : ''}`;
  taskSpan.textContent = todo.task;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.innerHTML = 'Edit ☺';
  editBtn.className = 'edit';
  editBtn.onclick = () => enableEdit(taskSpan, todo.id);

  const delBtn = document.createElement('button');
  delBtn.innerHTML = 'Hapus ☷';
  delBtn.className = 'delete';
  delBtn.onclick = () => deleteTodo(todo.id);

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

// === Inline Edit ===
function enableEdit(spanElement, todoId) {
  const currentText = spanElement.textContent;

  const editContainer = document.createElement('div');
  editContainer.className = 'edit-container';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.className = 'edit-input';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save 💾';
  saveBtn.className = 'save-btn';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel ✖';
  cancelBtn.className = 'cancel-btn';

  editContainer.appendChild(input);
  editContainer.appendChild(saveBtn);
  editContainer.appendChild(cancelBtn);
  spanElement.replaceWith(editContainer);
  input.focus();

  async function saveEdit() {
    const newText = input.value.trim();
    if (!newText) return alert('Task cannot be empty!');
    if (newText === currentText) {
      editContainer.replaceWith(createTaskSpan(currentText));
      return;
    }

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
  }

  saveBtn.addEventListener('click', saveEdit);
  input.addEventListener('keypress', e => { if (e.key === 'Enter') saveEdit(); });
  cancelBtn.addEventListener('click', () => editContainer.replaceWith(createTaskSpan(currentText)));
}

function createTaskSpan(text) {
  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = text;
  return span;
}

// Tambah todo
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

// Hapus todo
async function deleteTodo(id) {
  if (!confirm('Delete this task?')) return;
  try {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    await loadTodos();
  } catch (error) {
    alert('Error deleting task');
  }
}

// Filter
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Init
loadTodos();
