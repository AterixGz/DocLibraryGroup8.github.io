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
    const result = await pool.query(`
      SELECT id, filename AS name, url AS FileUrl, file_type AS type,
             department, document_date AS date, description,
             uploaded_by, uploaded_at, status
      FROM files
      ORDER BY uploaded_at DESC
    `);
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
      `SELECT id, filename AS name, url AS FileUrl, file_type AS type,
              department, document_date AS date, description,
              uploaded_by, uploaded_at, status
       FROM files
       WHERE uploaded_by = $1
       ORDER BY uploaded_at DESC`,
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

  if (!file || !uploadedBy) {
    return res.status(400).json({ message: 'File and uploadedBy are required' });
  }

  try {
    const url = `http://localhost:3000/uploads/${file.filename}`;

    const result = await pool.query(
      `INSERT INTO files 
        (filename, url, file_type, department, document_date, description, uploaded_by, uploaded_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'pending')
       RETURNING *`,
      [name || file.originalname, url, type, department, date, description, uploadedBy]
    );

    const fileData = result.rows[0];
    fileData.FileUrl = fileData.url;

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
// 🔹 1. เพิ่มพนักงานใหม่
app.post("/api/users", async (req, res) => {
  const { first_name, last_name, employee_id, department_id } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO users (first_name, last_name, employee_id, department_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [first_name, last_name, employee_id, department_id]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "เพิ่มผู้ใช้ไม่สำเร็จ" });
  }
});

// 🔹 2. เพิ่มสิทธิ์ให้พนักงาน
app.post("/api/permissions", async (req, res) => {
  const { employeeId, permissionName } = req.body;
  const grantedBy = 1; // สมมุติว่า admin ID คือ 1

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    const userResult = await client.query(
      `SELECT user_id, first_name, last_name, employee_id, department_id FROM users WHERE employee_id = $1`,
      [employeeId]
    );
    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "ไม่พบพนักงานนี้ในระบบ" });
    }
    const user = userResult.rows[0];

    const permResult = await client.query(
      `SELECT permission_id FROM permissions WHERE permission_name = $1`,
      [permissionName]
    );
    if (permResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "ไม่พบสิทธิ์นี้ในระบบ" });
    }
    const permissionId = permResult.rows[0].permission_id;

    await client.query(
      `INSERT INTO user_permissions (user_id, permission_id, granted_by)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [user.user_id, permissionId, grantedBy]
    );

    const allPermsResult = await client.query(
      `SELECT p.permission_name FROM user_permissions up
       JOIN permissions p ON up.permission_id = p.permission_id
       WHERE up.user_id = $1`,
      [user.user_id]
    );

    const permissions = allPermsResult.rows.map(p => p.permission_name);
    await client.query("COMMIT");
    client.release();

    res.status(201).json({
      message: "เพิ่มสิทธิ์สำเร็จ",
      user: {
        firstName: user.first_name,
        lastName: user.last_name,
        employeeId: user.employee_id,
        documentAccess: permissions.includes("document"),
        permissionAccess: permissions.includes("permission"),
        reportsAccess: permissions.includes("reports")
      }
    });
  } catch (err) {
    console.error("Error adding permission:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดระหว่างการเพิ่มสิทธิ์" });
  }
});

// 🔹 3. ดึงรายการผู้ใช้พร้อมสิทธิ์ทั้งหมด
app.get("/api/permission", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.employee_id, d.department_name,
              ARRAY_REMOVE(ARRAY_AGG(p.permission_name), NULL) AS permissions
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.department_id
       LEFT JOIN user_permissions up ON u.user_id = up.user_id
       LEFT JOIN permissions p ON up.permission_id = p.permission_id
       GROUP BY u.user_id, d.department_name`
    );

    const users = result.rows.map(u => ({
      firstName: u.first_name,
      lastName: u.last_name,
      employeeId: u.employee_id,
      department: u.department_name,
      documentAccess: u.permissions.includes("document"),
      permissionAccess: u.permissions.includes("permission"),
      reportsAccess: u.permissions.includes("reports")
    }));

    client.release();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.delete('/api/files/soft-delete/:id', async (req, res) => {
  const { id } = req.params;
  console.log("👉 Soft delete request for ID:", id); // ✅ debug

  try {
    const result = await pool.query('SELECT * FROM files WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      console.warn("❌ File not found for soft delete:", id); // log เพิ่มเติม
      return res.status(404).json({ message: 'File not found' });
    }

    const file = result.rows[0];

    await pool.query(`
      INSERT INTO deleted_files 
      (original_file_id, filename, url, uploaded_by, uploaded_at, file_type, department, document_date, description, deleted_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) -- ✅ เพิ่ม deleted_at
    `, [
      file.id, file.filename, file.url, file.uploaded_by, file.uploaded_at,
      file.file_type, file.department, file.document_date, file.description
    ]);

    await pool.query('DELETE FROM files WHERE id = $1', [id]);

    res.json({ message: 'File moved to trash' });
  } catch (err) {
    console.error("❌ Soft delete failed:", err);
    res.status(500).send('Soft delete failed');
  }
});


app.put('/api/files/restore/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM deleted_files WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found in trash' });

    const file = result.rows[0];

    await pool.query(`
      INSERT INTO files (filename, url, uploaded_by, uploaded_at, file_type, department, document_date, description)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    `, [
      file.filename, file.url, file.uploaded_by, file.uploaded_at,
      file.file_type, file.department, file.document_date, file.description
    ]);

    await pool.query('DELETE FROM deleted_files WHERE id = $1', [id]);
    res.json({ message: 'Restored' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Restore failed');
  }
});

app.delete('/api/files/permanent-delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT url FROM deleted_files WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });

    const filePath = path.join(__dirname, 'uploads', path.basename(result.rows[0].url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM deleted_files WHERE id = $1', [id]);
    res.json({ message: 'Permanently deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Permanent delete failed');
  }
});

app.get('/api/files/trash', async (req, res) => {
  const userId = req.query.userId;

  try {
    let result;

    if (userId) {
      result = await pool.query(`
        SELECT id, filename AS name, url AS FileUrl, file_type AS type, department,
               document_date AS date, description, uploaded_by, uploaded_at, deleted_at 
        FROM deleted_files 
        WHERE uploaded_by = $1
        ORDER BY deleted_at DESC
      `, [userId]);
    } else {
      // fallback ถ้าไม่มี userId ก็ไม่คืนไฟล์เลย
      return res.status(400).json({ message: 'Missing user ID' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch trash');
  }
});

app.get('/api/files/approved', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, filename AS name, url AS FileUrl, file_type AS type, department,
             document_date AS date, description, uploaded_by, uploaded_at
      FROM files
      WHERE status = 'approved'
      ORDER BY uploaded_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch approved files' });
  }
});

app.put('/api/files/approve/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' หรือ 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `UPDATE files SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'File not found' });

    res.json({ message: `File ${status}`, file: result.rows[0] });
  } catch (err) {
    console.error('Approval Error:', err);
    res.status(500).send('Approval failed');
  }
});

