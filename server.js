const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//NYAMBUNGIN KEDATABASE
const db = mysql.createConnection({
  host: 'host.docker.internal',
  user: 'root',
  password: 'root',
  database: 'todo_db',
  port: 3307
});


db.connect(err => {
  if (err) {
    console.error('❌ Gagal koneksi ke MySQL:', err.message);
  } else {
    console.log('✅ Terhubung ke MySQL Database di port 3307');
  }
});

// RUTE
app.get('/todos', (req, res) => {
  db.query('SELECT * FROM todos ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/todos', (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: 'Task is required' });
  db.query('INSERT INTO todos (task) VALUES (?)', [task], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, task, status: 0 });
  });
});

app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.query('UPDATE todos SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM todos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Todo deleted' });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));
