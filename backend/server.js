const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});


// database connection
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'task_manager',
  password: 'Sanika_user',
  port: 5432,
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err));


  // API endpoint to create a new task
  app.post('/tasks', async (req, res) => {
  try {
    const { title, priority, due_date } = req.body;

    const result = await pool.query(
      'INSERT INTO tasks (title, priority, due_date) VALUES ($1, $2, $3) RETURNING *',
      [title, priority, due_date]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// API endpoint to get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// API endpoint to update a task
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, priority, due_date } = req.body;

    const result = await pool.query(
      'UPDATE tasks SET title=$1, status=$2, priority=$3, due_date=$4 WHERE id=$5 RETURNING *',
      [title, status, priority, due_date, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// API endpoint to delete a task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM tasks WHERE id=$1', [id]);

    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});