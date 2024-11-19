import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import Sidebar from "./Sidebar";
import Home from "./components/Home/Home";
import Administrator from "./components/Administrator/Administrator";
import Document from "./components/Document/Document";
import Permission from "./components/Permission/Permission";
import Reports from "./components/Reports/Reports";
import addFileReport from "./components/Reports/ไฟล์ที่เพิ่ม/addFile"
import removeFileReport from "./components/Reports/ไฟล์ที่ลบ/removeFile"
import Help from "./components/Help/Help";
import Profile from "./components/Profile/Profile";
import Login from "./page/Login/Login";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import MyDocument from "./components/MyDocument/MyDocument";
import { verifyUser } from "./data/users";

import "./App.css";

function App() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("guest"); // กำหนดค่าเริ่มต้นเป็น "guest"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (username && password) {
      const user = verifyUser(username, password);
      if (user) {
        setRole(user.role); // หากมีข้อมูลผู้ใช้, อัพเดต role
        setUserData(user);
      } else {
        console.error("Invalid credentials");
      }
    }
  }, [username, password]);

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="*"
            element={
              <Login
                setToken={setToken}
                setRole={setRole}
                setUsername={setUsername}
                setPassword={setPassword}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="d-flex">
        {role !== "guest" && <Sidebar user={userData} />}
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home role={role} />} /> {/* ส่ง role ไปที่ Home */}
            {role !== "guest" && (
              <>
                <Route path="/administrator" element={<Administrator />} />
                <Route path="/my-document" element={<MyDocument />} />
                <Route path="/document" element={<Document />} />
                <Route path="/permission" element={<Permission />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/ไฟล์ที่เพิ่ม" element={<addFileReport />} />
                <Route path="/reports/ไฟล์ที่ลบ" element={<removeFileReport />} />
                <Route path="/help" element={<Help />} />
                <Route path="/profile" element={<Profile username={username} password={password} />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
