require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');


const app = express();
const PORT = process.env.PORT || 3000;
// เพิ่มด้านบน
const authenticateToken = require('./middleware/authenticate');

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/Avatar', express.static(path.join(__dirname, 'Avatar')));

// จำกัด 1 request ต่อ 10 วินาที ต่อ IP สำหรับการนับ view
const viewLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 วินาที
  max: 1, // 1 ครั้งต่อ window
  message: { error: 'Too many views from this IP, please try again later.' }
});

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Set timezone for all connections
pool.on('connect', (client) => {
  client.query('SET timezone = "Asia/Bangkok"');
});

const cleanupTrash = async () => {
  console.log('🧹 เริ่มทำความสะอาดถังขยะ...');
  try {
    // หาไฟล์ที่อยู่ในถังขยะเกิน 30 วัน
    const result = await pool.query(`
      SELECT id, url 
      FROM deleted_files 
       WHERE deleted_at < (NOW() + INTERVAL '543 years') - INTERVAL '30 days'
    `);
    
    if (result.rows.length === 0) {
      console.log('✅ ไม่พบไฟล์ที่ต้องลบ');
      return;
    }
    
    console.log(`🗑️ พบไฟล์ที่ต้องลบ ${result.rows.length} ไฟล์`);
    
    // ลบไฟล์จริงในระบบไฟล์
    for (const file of result.rows) {
      const filePath = path.join(__dirname, 'uploads', path.basename(file.url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ ลบไฟล์: ${path.basename(file.url)}`);
      }
      
      // ลบข้อมูลไฟล์จากฐานข้อมูล
      await pool.query('DELETE FROM deleted_files WHERE id = $1', [file.id]);
    }
    
    console.log(`✅ ลบไฟล์ทั้งหมด ${result.rows.length} ไฟล์เรียบร้อยแล้ว`);
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดในการทำความสะอาดถังขยะ:', err);
  }
};
// Helper function to format dates consistently
const formatDate = (date) => {
  if (!date) return null;
  return date.toISOString().replace('T', ' ').substring(0, 16);
};

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

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'Avatar');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const avatarUpload = multer({ storage: avatarStorage });


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
    const result = await pool.query("SELECT id, username, first_name, last_name, role_id, email, department, employee_id FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Home
// Get all files - FIXED TIMEZONE
// แก้ไขส่วนของ Get all files
app.get('/api/files', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        filename AS name, 
        url AS FileUrl, 
        file_type AS type,
        department, 
        TO_CHAR(document_date, 'YYYY-MM-DD HH24:MI') AS date,
        description,
        uploaded_by, 
        TO_CHAR(uploaded_at, 'YYYY-MM-DD HH24:MI') AS uploaded_at,
        status,
        COALESCE(download_count, 0) AS download_count
      FROM files
      ORDER BY uploaded_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch files:', err);
    res.status(500).send('Failed to fetch files');
  }
});

// Get files uploaded by specific user - FIXED TIMEZONE
app.get('/api/files/user/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const result = await pool.query(
      `SELECT id,
              filename AS name,
              url AS FileUrl,
              file_type AS type,
              department, 
              TO_CHAR(document_date, 'YYYY-MM-DD HH24:MI') AS date,
              TO_CHAR(uploaded_at, 'YYYY-MM-DD HH24:MI') AS uploaded_at_formatted,
              description,
              uploaded_by,
              uploaded_at,
              status,
              reason_status
       FROM files
       WHERE uploaded_by = $1
       ORDER BY uploaded_at DESC`,
      [userId]
    );

    const formattedResults = result.rows.map(row => ({
      ...row,
      uploaded_at_formatted: row.uploaded_at_formatted,
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error('Failed to fetch user files:', err);
    res.status(500).send('Failed to fetch user files');
  }
});

// Update file route
app.put('/api/files/:id', async (req, res) => {
  const fileId = req.params.id;
  const { name, type, date, department } = req.body;

  try {
    const result = await pool.query(
      `UPDATE files 
       SET filename = $1, file_type = $2, document_date = $3, department = $4 
       WHERE id = $5 
       RETURNING *`,
      [name, type, date, department, fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const fileData = result.rows[0];
    fileData.FileUrl = fileData.url;

    res.json(fileData);
  } catch (err) {
    console.error('Error updating file:', err);
    res.status(500).json({ message: 'Failed to update file' });
  }
});


// Upload file route - FIXED TIMEZONE
// แก้ไขที่ฟังก์ชัน upload file route
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { name, type, department, date, description, uploadedBy } = req.body;
  
  if (!file || !uploadedBy) {
    return res.status(400).json({ message: 'File and uploadedBy are required' });
  }

  try {
    const url = `http://localhost:3000/uploads/${file.filename}`;
    
    // แปลงวันที่จาก ค.ศ. เป็น พ.ศ.
    let documentDate = date;
    if (date) {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        // เพิ่ม 543 ปีเข้าไปในปี ค.ศ. เพื่อให้เป็น พ.ศ.
        const thaiYear = dateObj.getFullYear() + 543;
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();
        
        // จัดรูปแบบเป็น YYYY-MM-DD HH:MM สำหรับเก็บในฐานข้อมูล
        documentDate = `${thaiYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    // ใช้ฟังก์ชัน NOW() ของ PostgreSQL และแปลงเป็น พ.ศ. โดยใช้ฟังก์ชันของ PostgreSQL
    const result = await pool.query(
      `INSERT INTO files 
        (filename, url, file_type, department, document_date, description, uploaded_by, uploaded_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 
        (NOW() AT TIME ZONE 'Asia/Bangkok')::timestamp + INTERVAL '543 years', 'pending')
       RETURNING *`,
      [name || file.originalname, url, type, department, documentDate, description, uploadedBy]
    );

    const fileData = result.rows[0];
    fileData.FileUrl = fileData.url;

    res.status(201).json(fileData);
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});
// Download file route
app.get('/api/files/download/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  // เพิ่ม: อัปเดต download_count ในฐานข้อมูล
  try {
    await pool.query(
      `UPDATE files SET download_count = COALESCE(download_count, 0) + 1 WHERE url LIKE $1`,
      [`%/${filename}`]
    );
  } catch (err) {
    console.error('Error updating download_count:', err);
    // ไม่ต้อง return error ให้ user
  }

  const file = fs.readFileSync(filePath);

  const mimeType = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';

  if (mimeType === '.pdf') contentType = 'application/pdf';
  else if (mimeType === '.doc' || mimeType === '.docx') contentType = 'application/msword';
  else if (mimeType === '.xls' || mimeType === '.xlsx') contentType = 'application/vnd.ms-excel';
  else if (mimeType === '.png') contentType = 'image/png';
  else if (mimeType === '.jpg' || mimeType === '.jpeg') contentType = 'image/jpeg';

  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', file.length);

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
    const result = await pool.query(`
      SELECT u.*, r.name AS role_name FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.username = $1
    `, [username]);

    if (result.rows.length === 0) return res.status(404).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    let token = user.token;

    if (!token) {
      const payload = {
        id: user.id,
        role: user.role_name,
        timestamp: Date.now(),
        rand: Math.random().toString(36).substring(2),
      };
      token = jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });

      await pool.query(`UPDATE users SET token = $1 WHERE id = $2`, [token, user.id]);
    }

    const permRes = await pool.query(`
      SELECT p.name FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1
    `, [user.role_id]);

    const permissionNames = permRes.rows.map(p => p.name);

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
        avatar: user.avatar,
        employee_id: user.employee_id,
        token,
        permissions: permissionNames
      }
    });
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

// Get profile
app.get('/api/profile', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.department, u.avatar, u.employee_id,
              r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      role: user.role_name,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      department: user.department,
      avatar: user.avatar,
      employee_id: user.employee_id,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Report Pages - FIXED TIMEZONE
// Get latest files
app.get('/api/files/latest', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, filename, department, 
       TO_CHAR(uploaded_at, 'YYYY-MM-DD HH24:MI') AS uploaded_at 
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

// Upload summary
// Update the uploads-summary endpoint
// Uploads by user - approved files only

const uploadsDir = path.join(__dirname, 'uploads');

app.get("/api/approved-file-extensions-from-folder", async (req, res) => {
  try {
    // ดึง url ของไฟล์ที่ status = 'approved' จากฐานข้อมูล
    const dbResult = await pool.query(`
      SELECT url FROM files WHERE status = 'approved'
    `);

    // นับจำนวนแต่ละนามสกุลไฟล์จาก url
    const extCount = {};
    dbResult.rows.forEach(row => {
      const url = row.url;
      const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
      if (match) {
        const ext = match[1].toUpperCase();
        extCount[ext] = (extCount[ext] || 0) + 1;
      }
    });

    // แปลงเป็น array และเรียงลำดับ
    const result = Object.entries(extCount)
      .map(([extension, count]) => ({ extension, count }))
      .sort((a, b) => b.count - a.count);

    res.json(result);
  } catch (err) {
    console.error("Error fetching approved file extensions from url:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Uploads by user - FIXED TIMEZONE
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
// ✅ ใช้ role_id ดึง permission ตามบทบาท
app.get("/api/users/:id/permissions", async (req, res) => {
  const userId = req.params.id;
  try {
    const userResult = await pool.query('SELECT role_id FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const roleId = userResult.rows[0].role_id;

    const result = await pool.query(`
      SELECT p.name FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1
    `, [roleId]);

    const permissionNames = result.rows.map(row => row.name);
    res.json(permissionNames);
  } catch (err) {
    console.error("Error fetching user permissions:", err);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
});


// เพิ่ม / ลบ permission ของ user
app.post('/api/roles/:id/permissions', async (req, res) => {
  const roleId = req.params.id;
  const { permissions } = req.body;

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: "permissions must be an array" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

    for (let permName of permissions) {
      const permRes = await client.query('SELECT id FROM permissions WHERE name = $1', [permName]);
      if (permRes.rows.length > 0) {
        const permId = permRes.rows[0].id;
        await client.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [roleId, permId]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Permissions updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error saving role permissions:", err);
    res.status(500).json({ error: "Failed to save permissions" });
  } finally {
    client.release();
  }
});

// Get permissions
app.get("/api/permissions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM permissions ORDER BY module, name");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching permissions:", err);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
});

// GET permission ตาม role id
app.get('/api/roles/:id/permissions', async (req, res) => {
  const roleId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.description
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1
    `, [roleId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching role permissions:", err);
    res.status(500).json({ error: "Failed to fetch role permissions" });
  }
});

// Get roles with authentication
app.get('/api/roles', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch roles');
  }
});

// Get users with authentication
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.first_name, u.last_name, u.role_id,
             r.name AS role_name, u.email, u.department, u.employee_id
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Soft delete - FIXED TIMEZONE
app.delete('/api/files/soft-delete/:id', async (req, res) => {
  const { id } = req.params;
  console.log("👉 Soft delete request for ID:", id);

  try {
    const result = await pool.query('SELECT * FROM files WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      console.warn("❌ File not found for soft delete:", id);
      return res.status(404).json({ message: 'File not found' });
    }

    const file = result.rows[0];

    await pool.query(`
      INSERT INTO deleted_files 
      (original_file_id, filename, url, uploaded_by, uploaded_at, file_type, department, document_date, description, deleted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
        (NOW() AT TIME ZONE 'Asia/Bangkok')::timestamp + INTERVAL '543 years')
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
// Restore file - FIXED TIMEZONE
app.put('/api/files/restore/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        filename,
        url,
        uploaded_by,
        uploaded_at,
        file_type,
        department,
        document_date,
        description
      FROM deleted_files 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found in trash' });
    }

    const file = result.rows[0];

    await pool.query(`
      INSERT INTO files 
        (filename, url, uploaded_by, uploaded_at, file_type, department, document_date, description)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      file.filename,
      file.url,
      file.uploaded_by,
      file.uploaded_at,
      file.file_type,
      file.department,
      file.document_date,
      file.description
    ]);

    await pool.query('DELETE FROM deleted_files WHERE id = $1', [id]);
    res.json({ message: 'Restored' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Restore failed');
  }
});

// Permanent delete
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
app.post('/api/admin/cleanup-trash', authenticateToken, async (req, res) => {
  try {
    // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
    const userRole = req.user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
    }
    
    await cleanupTrash();
    res.json({ message: 'ลบไฟล์ในถังขยะที่เกิน 30 วันเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error in manual trash cleanup:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบไฟล์ในถังขยะ' });
  }
});
// Cleanup trash - FIXED TIMEZONE
cron.schedule('0 0 * * *', () => {
  console.log('🕛 เริ่มงานทำความสะอาดถังขยะประจำวัน');
  cleanupTrash();
});
// Get trash - FIXED TIMEZONE
app.get('/api/files/trash', async (req, res) => {
  const userId = req.query.userId;

  try {
    let result;

    if (userId) {
      result = await pool.query(`
        SELECT id, 
               filename AS name, 
               url AS FileUrl, 
               file_type AS type, 
               department,
               TO_CHAR(document_date, 'YYYY-MM-DD HH24:MI') AS date,
               description, 
               uploaded_by,
               TO_CHAR(uploaded_at, 'YYYY-MM-DD HH24:MI') AS uploaded_at,
               TO_CHAR(deleted_at, 'YYYY-MM-DD HH24:MI') AS deleted_at,
               deleted_at AS raw_deleted_at,
               (deleted_at + INTERVAL '30 days') AS expiry_date,
               TO_CHAR((deleted_at + INTERVAL '30 days'), 'YYYY-MM-DD HH24:MI') AS formatted_expiry_date,
               -- แก้การคำนวณวันที่เหลือ โดยใช้ NOW() เทียบกับวันหมดอายุโดยตรง
               EXTRACT(DAY FROM ((deleted_at + INTERVAL '30 days') - (NOW() AT TIME ZONE 'Asia/Bangkok')::timestamp)) AS days_left
        FROM deleted_files 
        WHERE uploaded_by = $1
        ORDER BY deleted_at DESC
      `, [userId]);

      // เพิ่มข้อมูลวันหมดอายุและจำนวนวันที่เหลือ
      result.rows = result.rows.map(row => ({
        ...row,
        days_left: Math.ceil(row.days_left),
        will_delete_soon: row.days_left <= 7
      }));
    } else {
      return res.status(400).json({ message: 'Missing user ID' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch trash');
  }
});

// Get approved files - FIXED TIMEZONE
app.get('/api/files/approved', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, 
             filename AS name, 
             url AS FileUrl, 
             file_type AS type, 
             department,
             TO_CHAR(document_date, 'YYYY-MM-DD HH24:MI') AS date,
             TO_CHAR(uploaded_at, 'YYYY-MM-DD HH24:MI') AS uploaded_at,
             description, 
             uploaded_by
      FROM files
      WHERE status = 'approved'
      ORDER BY uploaded_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch approved files' });
  }
});

// Approve file
app.put('/api/files/approve/:id', async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body; // เพิ่ม reason

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `UPDATE files SET status = $1, reason_status = $2 WHERE id = $3 RETURNING *`,
      [status, reason || null, id] // เพิ่ม reason_status
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'File not found' });

    res.json({ message: `File ${status}`, file: result.rows[0] });
  } catch (err) {
    console.error('Approval Error:', err);
    res.status(500).send('Approval failed');
  }
});

// Create user
app.post("/api/users/create", async (req, res) => {
  const {
    username, password, first_name, last_name,
    email, department, role_id, employee_id
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users 
      (username, password, first_name, last_name, email, department, role_id, employee_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [username, hashedPassword, first_name, last_name, email, department, role_id, employee_id]
    );

    res.json({ message: "สร้างผู้ใช้สำเร็จ" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "สร้างผู้ใช้ล้มเหลว" });
  }
});

// Get departments
app.get('/api/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT department_id, department_name FROM departments ORDER BY department_name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, department, role_id, password } = req.body;

  try {
    const fields = [first_name, last_name, email, department, role_id];
    let query = `
      UPDATE users SET first_name = $1, last_name = $2, email = $3, department = $4, role_id = $5`;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += `, password = $6 WHERE id = $7 RETURNING *`;
      fields.push(hashed, id);
    } else {
      query += ` WHERE id = $6 RETURNING *`;
      fields.push(id);
    }

    const result = await pool.query(query, fields);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update user failed:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete user
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// PUT: อัปเดตเฉพาะโปรไฟล์ตนเอง (ไม่ยุ่งกับ role_id / department)
app.put('/api/profile/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, avatar } = req.body;

  try {
    const result = await pool.query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, email = $3, avatar = $4
      WHERE id = $5 
      RETURNING id, first_name, last_name, email, avatar
    `, [first_name, last_name, email, avatar, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

app.post('/api/profile/upload-avatar/:id', avatarUpload.single('avatar'), async (req, res) => {
  const userId = req.params.id;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  const fileUrl = `http://localhost:3000/Avatar/${file.filename}`;

  try {
    const result = await pool.query(
      `UPDATE users SET avatar = $1 WHERE id = $2 RETURNING avatar`,
      [fileUrl, userId]
    );
    res.json({ avatar: result.rows[0].avatar });
  } catch (err) {
    console.error('Error updating avatar:', err);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

app.post("/api/request-otp", async (req, res) => {
  const { email } = req.body;
  const nodemailer = require("nodemailer");

  try {
    // ✅ ตรวจสอบว่ามี user จริง
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ message: "ไม่พบบัญชีอีเมลนี้" });

    // ✅ สร้าง OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // หมดอายุใน 5 นาที

    // ✅ บันทึก OTP ลง DB
    await pool.query(
      "INSERT INTO password_resets (user_id, email, otp_code, expires_at) VALUES ($1, $2, $3, $4)",
      [user.id, email, otp, expires]
    );

    // ✅ สร้าง transporter ด้วย Gmail
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // ✅ ตรวจสอบว่า transporter พร้อมใช้
    await transporter.verify();

    // ✅ ส่งอีเมลจริง
    const mailOptions = {
      from: `"ระบบ OTP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "รหัส OTP สำหรับรีเซ็ตรหัสผ่าน",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>สวัสดีคุณ ${user.first_name || ''} ${user.last_name || ''}</h2>
          <p>รหัส OTP สำหรับรีเซ็ตรหัสผ่านของคุณคือ:</p>
          <h1 style="color: #1d72b8;">${otp}</h1>
          <p>รหัสนี้จะหมดอายุใน 5 นาที</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.response);
    res.json({ message: "ส่ง OTP ไปยังอีเมลเรียบร้อยแล้ว" });
  } catch (err) {
    console.error("❌ OTP ส่งไม่สำเร็จ:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดขณะส่ง OTP" });
  }
});


app.post("/api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await pool.query(
      `SELECT * FROM password_resets 
       WHERE email = $1 AND otp_code = $2 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "OTP ไม่ถูกต้องหรือหมดอายุ" });
    }

    res.json({ message: "OTP ถูกต้อง" });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM password_resets 
       WHERE email = $1 AND otp_code = $2 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    const resetRequest = result.rows[0];
    if (!resetRequest) {
      return res.status(400).json({ message: "OTP ไม่ถูกต้องหรือหมดอายุ" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashed, email]);
    await pool.query("DELETE FROM password_resets WHERE email = $1", [email]); // ลบ OTP หลังใช้

    res.json({ message: "รีเซ็ตรหัสผ่านเรียบร้อยแล้ว" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

function isBot(userAgent) {
  return /bot|crawl|spider|slurp|curl|wget|python|scrapy/i.test(userAgent);
}

app.post('/api/website-view', viewLimiter, async (req, res) => {
  const { user_id } = req.body;
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // กัน bot/crawler
  if (isBot(userAgent)) {
    return res.status(200).json({ message: 'Bot ignored' });
  }

  try {
    await pool.query(
      `INSERT INTO website_views (user_id, user_agent, ip_address) VALUES ($1, $2, $3)`,
      [user_id || null, userAgent, ip]
    );
    res.json({ message: 'View recorded' });
  } catch (err) {
    console.error('Error recording website view:', err);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

app.get('/api/website-views/count', async (req, res) => {
  try {
    const result = await pool.query(`SELECT COUNT(*) AS count FROM website_views`);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Error fetching website views count:', err);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
