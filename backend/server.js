// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Authorization middleware
const authorize = (allowedRoles) => async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).send("Missing token");

  try {
    const result = await pool.query(
      `SELECT u.*, r.name AS role_name FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.token = $1`,
      [token]
    );

    if (result.rows.length === 0) return res.status(403).send("Invalid token");

    const userRole = result.rows[0].role_name;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).send("Access denied");
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("Authorization error");
  }
};

// Test DB route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database connection error');
  }
});

app.get("/api/users", async (req, res) => {
    try {
      const result = await pool.query("SELECT id, username, first_name, last_name, role_id, email, department, position, employee_id FROM users");
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

// Get all files (accessible by all roles)
app.get('/api/files', authorize(['admin', 'manager', 'worker']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM files ORDER BY uploaded_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch files');
  }
});

// Get files uploaded by specific user (self only unless admin)
app.get('/api/files/user/:userId', authorize(['admin', 'manager', 'worker']), async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (req.user.id !== userId && req.user.role_name !== 'admin') {
    return res.status(403).send("You can only view your own documents");
  }

  try {
    const result = await pool.query('SELECT * FROM files WHERE uploaded_by = $1 ORDER BY uploaded_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch user files');
  }
});

// Upload file (admin, manager, worker)
app.post('/api/files   ', authorize(['admin', 'manager', 'worker']), upload.single('file'), async (req, res) => {
  const file = req.file;
  const userId = req.user.id;
  if (!file || !userId) return res.status(400).send('File and userId are required');

  try {
    const url = `/uploads/${file.filename}`;
    const result = await pool.query(
      'INSERT INTO files (filename, url, uploaded_by) VALUES ($1, $2, $3) RETURNING *',
      [file.originalname, url, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to upload file');
  }
});

// Delete file (admin only)
app.delete('/api/files/:id', authorize(['admin']), async (req, res) => {
  const fileId = req.params.id;
  try {
    const result = await pool.query('DELETE FROM files WHERE id = $1 RETURNING *', [fileId]);
    if (result.rows.length === 0) return res.status(404).send('File not found');

    const filePath = path.join(__dirname, 'uploads', path.basename(result.rows[0].url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: 'File deleted', file: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete file');
  }
});

// Enhanced login route with JOIN roles table
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT u.*, r.name AS role_name FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.username = $1 AND u.password = $2`,
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = crypto.randomBytes(16).toString("hex");
      await pool.query('UPDATE users SET token = $1 WHERE id = $2', [token, user.id]);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          token,
          role: user.role_name,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          department: user.department,
          position: user.position,
          avatar: user.avatar,
          employee_id: user.employee_id
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
});

// Get roles (for permission check)
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch roles');
  }
});

// Get current user profile from token
app.get('/api/profile', authorize(['admin', 'manager', 'worker']), async (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    username: user.username,
    role: user.role_name,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    department: user.department,
    position: user.position,
    avatar: user.avatar,
    employee_id: user.employee_id
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
