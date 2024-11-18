// users.js

const users = [
  { 
    username: "Team", 
    password: "1234", 
    token: "token1", 
    role: "admin", 
    firstName: "สมชาย", 
    lastName: "ใจดี", 
    email: "somchai@example.com", 
    department: "การเงิน", 
    position: "ผู้จัดการ",
    avatar: "/img/bb.png"  // Correct path to avatar
  },
  { 
    username: "Vic", 
    password: "1234", 
    token: "token2", 
    role: "admin", 
    firstName: "วิทยา", 
    lastName: "ก้องฟ้า", 
    email: "vichai@example.com", 
    department: "ไอที", 
    position: "หัวหน้าฝ่าย",
    avatar: "/img/vic-avatar.png"  // Correct path to avatar
  },
  { 
    username: "user2", 
    password: "password2", 
    token: "token3", 
    role: "user", 
    firstName: "สมหญิง", 
    lastName: "ขยันทำ", 
    email: "somsing@example.com", 
    department: "การตลาด", 
    position: "เจ้าหน้าที่",
    avatar: "/img/user2-avatar.png"  // Correct path to avatar
  },
  { 
    username: "user3", 
    password: "password3", 
    token: "token3", 
    role: "user", 
    firstName: "สมหมาย", 
    lastName: "ขยันเกิน", 
    email: "somhai@example.com", 
    department: "การตลาดล่าง", 
    position: "เจ้าหน้าที่ระดับสูง",
    avatar: "/img/user2-avatar.png"  // Correct path to avatar
  },
  // { 
  //   username: "guest", 
  //   password: "guestpassword", 
  //   token: "guest_token", 
  //   role: "guest", 
  //   firstName: "ผู้เยี่ยมชม", 
  //   lastName: "-", 
  //   email: "guest@example.com", 
  //   department: "-", 
  //   position: "ผู้เยี่ยมชม",
  //   avatar: "/img/guest-avatar.png"  // Correct path to avatar
  // }
];

export const verifyUser = (username, password) => {
  const user = users.find(user => user.username === username && user.password === password);
  return user || null;
};

export default users;
