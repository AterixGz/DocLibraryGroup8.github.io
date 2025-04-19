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
       RETURNING *`, // เปลี่ยนเป็นคืนทุก field
      [name, type, date, department, fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const fileData = result.rows[0];
    fileData.FileUrl = fileData.url; // ⭐ เพิ่มให้ React ใช้ FileUrl ได้ทุกครั้ง

    res.json(fileData); // ส่งกลับให้ frontend ใช้ได้เลย
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
    const fileData = result.rows[0];
    fileData.FileUrl = fileData.url; // ให้ชื่อฟิลด์สอดคล้องกับ frontend

    res.status(201).json(fileData);
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

// Permission
// new permissions
app.post("/api/permissions", async (req, res) => {
  const { employeeId, permissionName } = req.body;
  const grantedBy = 1; // สมมุติว่า admin ID คือ 1

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. ค้นหาผู้ใช้งานจาก employeeId
      const userQuery = `
        SELECT u.user_id, u.first_name, u.last_name, u.employee_id, d.department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.department_id
        WHERE u.employee_id = $1
      `;
      const userResult = await client.query(userQuery, [employeeId]);

      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "ไม่พบพนักงานนี้ในระบบ" });
      }

      const user = userResult.rows[0];

      // 2. ตรวจสอบชื่อสิทธิ์ และหา permission_id
      const permQuery = `SELECT permission_id FROM permissions WHERE permission_name = $1`;
      const permResult = await client.query(permQuery, [permissionName]);

      if (permResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "ไม่พบสิทธิ์นี้ในระบบ" });
      }

      const permissionId = permResult.rows[0].permission_id;

      // 3. เพิ่มสิทธิ์ให้ผู้ใช้
      const insertQuery = `
        INSERT INTO user_permissions (user_id, permission_id, granted_by)
        VALUES ($1, $2, $3)
      `;
      await client.query(insertQuery, [user.user_id, permissionId, grantedBy]);

      // 4. ดึงสิทธิ์ทั้งหมดของผู้ใช้คนนี้
      const allPermsQuery = `
        SELECT p.permission_name
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.permission_id
        WHERE up.user_id = $1
      `;
      const allPermsResult = await client.query(allPermsQuery, [user.user_id]);
      const permissions = allPermsResult.rows.map(p => p.permission_name);

      // 5. แปลงเป็นสิทธิ์แต่ละหมวด
      const documentAccess = permissions.includes("document");
      const permissionAccess = permissions.includes("permission");
      const reportsAccess = permissions.includes("reports");

      await client.query('COMMIT');

      // 6. ส่ง response กลับไป
      res.status(201).json({
        message: "เพิ่มสิทธิ์สำเร็จ",
        user: {
          firstName: user.first_name,
          lastName: user.last_name,
          department: user.department_name || "ไม่ระบุแผนก",
          employeeId: user.employee_id,
          documentAccess,
          permissionAccess,
          reportsAccess
        }
      });

    } catch (err) {
      await client.query('ROLLBACK');
      console.error("Transaction failed:", err);
      res.status(500).json({ error: "เกิดข้อผิดพลาดระหว่างการเพิ่มสิทธิ์" });
    } finally {
      client.release();
    }

  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
