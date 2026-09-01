const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// --- USER API ROUTES ---

// GET: Fetch all users
app.get('/api/users', (req, res) => {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

// POST: Create a new user
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required.' });
    }

    const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
    db.run(sql, [name, email], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({
            message: 'User created successfully',
            userId: this.lastID
        });
    });
});

// --- RECORDS API ROUTES ---

// GET: Fetch all records with associated user info
app.get('/api/records', (req, res) => {
    const sql = `
        SELECT records.id, records.title, records.amount, records.created_at, users.name as user_name 
        FROM records 
        LEFT JOIN users ON records.user_id = users.id 
        ORDER BY records.created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

// POST: Add a new record
app.post('/api/records', (req, res) => {
    const { title, amount, user_id } = req.body;
    if (!title || amount === undefined) {
        return res.status(400).json({ error: 'Title and amount are required.' });
    }

    const sql = 'INSERT INTO records (title, amount, user_id) VALUES (?, ?, ?)';
    db.run(sql, [title, amount, user_id || null], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Record created successfully',
            recordId: this.lastID
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});