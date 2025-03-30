import { Router } from "express";
import jwt from "jsonwebtoken";
import {
  addNewUser,
  getUserByUsername,
  getUserWithRoleById,
  getAllUsers,
  updateUserPassword
} from "../controllers/userController.js";

// Define JWT_SECRET from environment variable or use default
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; 
// In production, should only use environment variable

// Define token expiry
const TOKEN_EXPIRY = "24h"; // 24 hours for convenience

const usersRouter = Router();

/**
 * Middleware: Verify JWT Token and extract user ID
 */
const jwtTokenMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(403).json({ message: "กรุณาเข้าสู่ระบบ", error: "Token is required" });
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(" ")[1] 
      : authHeader;

    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if (err) {
        console.error("Invalid token error:", err.message);
        return res.status(401).json({ 
          message: "โทเค็นไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่", 
          error: "Invalid or expired token" 
        });
      }

      req.user = { 
        id: payload.id, 
        roleId: payload.role_id,
        username: payload.username 
      };
      
      next();
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({ 
      message: "เกิดข้อผิดพลาดในการตรวจสอบการเข้าสู่ระบบ", 
      error: "Authentication error" 
    });
  }
};

/**
 * Middleware: Check admin privileges
 */
const adminMiddleware = (req, res, next) => {
  // role_id = 1 is ADMIN
  if (req.user.roleId !== 1) {
    return res.status(403).json({ 
      message: "คุณไม่มีสิทธิ์ในการเข้าถึงส่วนนี้", 
      error: "Admin access required" 
    });
  }
  next();
};

/**
 * @route   POST /users/register
 * @desc    Register new user
 */
// Remove jwtTokenMiddleware from the /register route
usersRouter.post("/register", async (req, res) => {
  const { 
    username, 
    password, 
    role_id, 
    first_name, 
    last_name, 
    email,
    department,
    position,
    employee_id
  } = req.body;

  // Check required fields
  if (!username || !password || !role_id) {
    return res.status(400).json({ 
      message: "กรุณากรอกข้อมูลที่จำเป็น", 
      error: "Missing required fields" 
    });
  }

  try {
    // Check if username already exists
    const existingUser = await getUserByUsername({ username });
    if (existingUser.length > 0) {
      return res.status(400).json({ 
        message: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว", 
        error: "Username already exists" 
      });
    }

    // Add new user to database without hashing password
    const userData = { 
      username, 
      password,  // No hashing here
      role_id,
      first_name, 
      last_name, 
      email,
      department,
      position,
      employee_id
    };
    
    const result = await addNewUser(userData);
    
    return res.status(201).json({ 
      message: "ลงทะเบียนผู้ใช้สำเร็จ", 
      userId: result.insertId
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({ 
      message: "เกิดข้อผิดพลาดในการลงทะเบียน", 
      error: error.message 
    });
  }
});


/**
 * @route   POST /users/login
 * @desc    Verify credentials and issue token
 */
usersRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน",
      error: "Username and password are required" 
    });
  }

  try {
    const result = await getUserByUsername({ username });
    if (result.length === 0) {
      return res.status(404).json({ 
        message: "ไม่พบชื่อผู้ใช้นี้ในระบบ", 
        error: "User not found" 
      });
    }

    const user = result[0];
    let passwordMatch = false;

    // Compare plain password (no bcrypt)
    passwordMatch = (password === user.password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        message: "รหัสผ่านไม่ถูกต้อง", 
        error: "Invalid password" 
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { 
        id: user.id, 
        role_id: user.role_id,
        username: user.username
      }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        first_name: user.first_name,
        last_name: user.last_name,
        department: user.department,
        position: user.position,
      },
      token
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ 
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ", 
      error: error.message 
    });
  }
});

/**
 * @route   GET /users/profile
 * @desc    Get current user profile
 */
usersRouter.get("/profile", jwtTokenMiddleware, async (req, res) => {
  try {
    const user = await getUserWithRoleById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        message: "ไม่พบข้อมูลผู้ใช้", 
        error: "User not found" 
      });
    }
    
    // Remove sensitive data before sending
    delete user.password;
    
    return res.status(200).json(user);
  } catch (error) {
    console.error("❌ Profile Error:", error);
    return res.status(500).json({ 
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้", 
      error: error.message 
    });
  }
});

/**
 * @route   GET /users
 * @desc    Get all users (Admin only)
 */
usersRouter.get("/", jwtTokenMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await getAllUsers();
    
    // Remove password data before sending
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    return res.status(200).json(safeUsers);
  } catch (error) {
    console.error("❌ Get All Users Error:", error);
    return res.status(500).json({ 
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ทั้งหมด", 
      error: error.message 
    });
  }
});

/**
 * @route   POST /users/verify-token
 * @desc    Verify if token is still valid
 */
usersRouter.post("/verify-token", jwtTokenMiddleware, (req, res) => {
  return res.status(200).json({ 
    valid: true, 
    user: {
      id: req.user.id,
      roleId: req.user.roleId,
      username: req.user.username
    }
  });
});

export default usersRouter;
