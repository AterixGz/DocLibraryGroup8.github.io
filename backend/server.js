require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, first_name, last_name, role_id, email, department, position, employee_id FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all files
app.get('/api/files', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, filename AS name, url AS FileUrl, file_type AS type, department, document_date AS date, description, uploaded_by, uploaded_at FROM files ORDER BY uploaded_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch files:', err);
    res.status(500).send('Failed to fetch files');
  }
});

// Get files uploaded by specific user
app.get('/api/files/user/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const result = await pool.query(
      'SELECT id, filename AS name, url AS FileUrl, file_type AS type, department, document_date AS date, description, uploaded_by, uploaded_at FROM files WHERE uploaded_by = $1 ORDER BY uploaded_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch user files:', err);
    res.status(500).send('Failed to fetch user files');
  }
});

// อัปเดต route การอัปโหลดไฟล์
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { name, type, department, date, description, uploadedBy } = req.body;

  // Debugging logs
  console.log("File:", file);
  console.log("Body:", req.body);

  if (!file || !uploadedBy) {
    return res.status(400).json({ message: 'File and uploadedBy are required' });
  }

  try {
    const url = `/uploads/${file.filename}`;
    const result = await pool.query(
      'INSERT INTO files (filename, url, file_type, department, document_date, description, uploaded_by, uploaded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [name || file.originalname, url, type, department, date, description, uploadedBy]
    );
    console.log("Database Insert Result:", result.rows[0]); // Log the database result
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error uploading file:", err); // Log the error
    res.status(500).json({ message: 'Failed to upload file' });
  }
});
// Delete file
app.delete('/api/files/:id', async (req, res) => {
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

// Login route
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
      res.json({
        message: 'Login successful',
        user: {
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

// Get roles
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch roles');
  }
});



app.get('/api/profile', async (req, res) => {
  const userId = req.query.userId; // Pass userId from the frontend as a query parameter
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, first_name, last_name, role_id, email, department, position, avatar, employee_id
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      role: user.role_id, // Assuming role_id is used instead of role_name
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      employee_id: user.employee_id,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
