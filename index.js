const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Root Route (Fixes "Cannot GET /")
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'MeklitApp Backend Server is running successfully!',
    endpoints: {
      health: 'GET /health',
      getUsers: 'GET /api/users',
      createUser: 'POST /api/users',
      getRecords: 'GET /api/records',
      createRecord: 'POST /api/records'
    }
  });
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// ----------------- USER ROUTES -----------------

// GET all users
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// POST new user
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
  db.run(query, [name, email], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name, email });
  });
});

// ----------------- RECORD ROUTES -----------------

// GET all records
app.get('/api/records', (req, res) => {
  db.all('SELECT * FROM records ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// POST new record
app.post('/api/records', (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const query = 'INSERT INTO records (title, description) VALUES (?, ?)';
  db.run(query, [title, description], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, title, description });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});