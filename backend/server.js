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

// เพิ่ม route สำหรับการอัปเดตไฟล์
app.put('/api/files/:id', async (req, res) => {
  const fileId = req.params.id;
  const { name, type, date, department } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE files 
       SET filename = $1, file_type = $2, document_date = $3, department = $4 
       WHERE id = $5 
       RETURNING id, filename AS name, url AS FileUrl, file_type AS type, department, document_date AS date, description, uploaded_by, uploaded_at`,
      [name, type, date, department, fileId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating file:', err);
    res.status(500).json({ message: 'Failed to update file' });
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
    // แก้ตรงนี้ - เพิ่ม domain และ port
    const url = `http://localhost:3000/uploads/${file.filename}`;
    const result = await pool.query(
      'INSERT INTO files (filename, url, file_type, department, document_date, description, uploaded_by, uploaded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [name || file.originalname, url, type, department, date, description, uploadedBy]
    );
    console.log("Database Insert Result:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// เพิ่ม route สำหรับการดาวน์โหลดไฟล์ที่จะตั้งค่า Content-Disposition
app.get('/api/files/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  // ตรวจสอบว่าไฟล์มีอยู่จริง
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  
  // อ่านไฟล์
  const file = fs.readFileSync(filePath);
  
  // กำหนดชนิดของไฟล์ (MIME type)
  const mimeType = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream'; // ค่าเริ่มต้น
  
  // กำหนด content type ตามนามสกุลไฟล์
  if (mimeType === '.pdf') contentType = 'application/pdf';
  else if (mimeType === '.doc' || mimeType === '.docx') contentType = 'application/msword';
  else if (mimeType === '.xls' || mimeType === '.xlsx') contentType = 'application/vnd.ms-excel';
  else if (mimeType === '.png') contentType = 'image/png';
  else if (mimeType === '.jpg' || mimeType === '.jpeg') contentType = 'image/jpeg';
  
  // ตั้งค่าส่วนหัวสำหรับการดาวน์โหลด
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', file.length);
  
  // ส่งไฟล์
  res.send(file);
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


// Report Pages
// Get latest files
app.get('/api/files/latest', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, filename, department, uploaded_at 
       FROM files 
       ORDER BY uploaded_at DESC 
       LIMIT 3`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch latest files:', err);
    res.status(500).json({ error: 'Failed to fetch latest files' });
  }
});


app.get("/api/uploads-summary", (req, res) => {
  const uploadDir = path.join(__dirname, "uploads");
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return res.status(500).json({ error: "Unable to read uploads directory" });
    }
    const summary = {};
    files.forEach((file) => {
      // ดึงนามสกุลไฟล์ (แปลงเป็นตัวพิมพ์ใหญ่ และตัดเครื่องหมาย . ออก)
      const ext = path.extname(file).toUpperCase().replace(".", "");
      summary[ext] = (summary[ext] || 0) + 1;
    });
    res.json(summary);
  });
});

// Endpoint สำหรับสรุปการอัพโหลดไฟล์ 30 วันที่ผ่านมา แบ่งกลุ่มตามชื่อคนที่อัพโหลด
app.get("/api/uploads-by-user", async (req, res) => {
  try {
    const query = `
      SELECT (u.first_name || ' ' || u.last_name) AS uploader, COUNT(*) AS count
      FROM files f
      JOIN users u ON f.uploaded_by = u.id
      WHERE f.uploaded_at >= NOW() - INTERVAL '30 DAY'
      GROUP BY uploader
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error aggregating uploads by user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Permission
// Get all permissions
app.get("/api/permissions", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, description, created_at FROM permissions ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching permissions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get permission by ID
app.get("/api/permissions/:id", async (req, res) => {
  try {
    const permissionId = parseInt(req.params.id);
    const result = await pool.query(
      "SELECT id, name FROM permissions WHERE id = $1", 
      [permissionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching permission:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create new permission
app.post("/api/permissions", async (req, res) => {
  try {
    const { name, description, code } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: "Name and code are required" });
    }
    
    const result = await pool.query(
      "INSERT INTO permissions (name, description, code, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, description, code, created_at",
      [name, description, code]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating permission:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update permission
app.put("/api/permissions/:id", async (req, res) => {
  try {
    const permissionId = parseInt(req.params.id);
    const { name, description, code } = req.body;
    
    // Check if permission exists
    const checkResult = await pool.query("SELECT id FROM permissions WHERE id = $1", [permissionId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }
    
    const result = await pool.query(
      "UPDATE permissions SET name = $1, description = $2, code = $3, updated_at = NOW() WHERE id = $4 RETURNING id, name, description, code, updated_at",
      [name, description, code, permissionId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating permission:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete permission
app.delete("/api/permissions/:id", async (req, res) => {
  try {
    const permissionId = parseInt(req.params.id);
    
    // Check if permission exists
    const checkResult = await pool.query("SELECT id FROM permissions WHERE id = $1", [permissionId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }
    
    // Delete user permissions references first
    await pool.query("DELETE FROM user_permissions WHERE permission_id = $1", [permissionId]);
    
    // Then delete the permission
    await pool.query("DELETE FROM permissions WHERE id = $1", [permissionId]);
    
    res.json({ message: "Permission deleted successfully" });
  } catch (err) {
    console.error("Error deleting permission:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get user permissions
app.get("/api/users/:userId/permissions", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.code 
       FROM permissions p
       JOIN user_permissions up ON p.id = up.permission_id
       WHERE up.user_id = $1
       ORDER BY p.id`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user permissions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Assign permission to user
app.post("/api/users/:userId/permissions", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { permissionId } = req.body;
    
    if (!permissionId) {
      return res.status(400).json({ error: "Permission ID is required" });
    }
    
    // Check if user exists
    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if permission exists
    const permCheck = await pool.query("SELECT id FROM permissions WHERE id = $1", [permissionId]);
    if (permCheck.rows.length === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }
    
    // Check if already assigned
    const existCheck = await pool.query(
      "SELECT id FROM user_permissions WHERE user_id = $1 AND permission_id = $2",
      [userId, permissionId]
    );
    
    if (existCheck.rows.length > 0) {
      return res.status(400).json({ error: "Permission already assigned to user" });
    }
    
    await pool.query(
      "INSERT INTO user_permissions (user_id, permission_id, created_at) VALUES ($1, $2, NOW())",
      [userId, permissionId]
    );
    
    res.status(201).json({ message: "Permission assigned successfully" });
  } catch (err) {
    console.error("Error assigning permission:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Remove permission from user
app.delete("/api/users/:userId/permissions/:permissionId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const permissionId = parseInt(req.params.permissionId);
    
    await pool.query(
      "DELETE FROM user_permissions WHERE user_id = $1 AND permission_id = $2",
      [userId, permissionId]
    );
    
    res.json({ message: "Permission removed successfully" });
  } catch (err) {
    console.error("Error removing permission:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Check if user has specific permission
app.get("/api/users/:userId/check-permission/:permissionCode", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { permissionCode } = req.params;
    
    const result = await pool.query(
      `SELECT COUNT(*) FROM user_permissions up
       JOIN permissions p ON up.permission_id = p.id
       WHERE up.user_id = $1 AND p.code = $2`,
      [userId, permissionCode]
    );
    
    const hasPermission = parseInt(result.rows[0].count) > 0;
    
    res.json({ hasPermission });
  } catch (err) {
    console.error("Error checking permission:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});