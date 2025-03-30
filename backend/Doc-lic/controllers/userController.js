import mysql from "mysql2/promise";

// Database configuration
const config = {
  host: "localhost",
  user: "user2",
  password: "user2",
  database: "jwt",
};

// Create connection pool
const pool = mysql.createPool(config);

// Helper function for database queries
const query = async (sql, params) => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

// User controller functions
export const addNewUser = async ({ username, password, role_id, first_name, last_name, email, department, position, employee_id }) => {
  const sql = "INSERT INTO users (username, password, role_id, first_name, last_name, email, department, position, employee_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  return await pool.execute(sql, [username, password, role_id, first_name, last_name, email, department, position, employee_id]);
};

export const getUserByUsername = async ({ username }) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  return await query(sql, [username]);
};

export const getUserWithRoleById = async (id) => {
  const sql = `SELECT users.id, users.username, users.first_name, users.last_name, 
               users.email, users.department, users.position, users.employee_id,
               users.role_id, roles.name AS role_name
               FROM users INNER JOIN roles ON users.role_id = roles.id 
               WHERE users.id = ?`;
  const result = await query(sql, [id]);
  return result.length > 0 ? result[0] : null;
};

export const getAllUsers = async () => {
  const sql = `SELECT users.id, users.username, users.first_name, users.last_name, 
              users.email, users.department, users.position, users.employee_id, 
              users.role_id, roles.name AS role_name 
              FROM users INNER JOIN roles ON users.role_id = roles.id`;
  return await query(sql);
};

export const updateUserPassword = async (userId, password) => {
  const sql = "UPDATE users SET password = ? WHERE id = ?";
  return await pool.execute(sql, [password, userId]);
};

// Function to update passwords to plaintext (utility function)
// No hashing involved anymore
export const updateAllPasswordsToPlaintext = async () => {
  const connection = await mysql.createConnection(config);
  try {
    const [users] = await connection.execute("SELECT id, password FROM users");
    for (const user of users) {
      // If password is already plaintext, don't change it
      // This function assumes no hashing is involved anymore
      // You can skip or implement additional logic if necessary
      if (!user.password) {
        console.log(`User with id ${user.id} has no password, skipping...`);
        continue;
      }
      
      // In this example, we're simply leaving passwords as they are
      // If you want to reset plaintext passwords or add custom logic, do so here.
    }
    console.log("All passwords have been processed.");
  } catch (error) {
    console.error("Error processing passwords:", error);
  } finally {
    await connection.end();
  }
};
