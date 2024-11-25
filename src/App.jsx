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
import AddFileReport from "./components/Reports/addFileList/addFile";
import RemoveFileReport from "./components/Reports/removeFileList/removeFile";
import Help from "./components/Help/Help";
import Profile from "./components/Profile/Profile";
import Login from "./page/Login/Login";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import MyDocument from "./components/MyDocument/MyDocument";
import { verifyUser } from "./data/users";

import { FileProvider } from "./components/FileContext/FileContext";

import "./App.css";

function App() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("guest");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (username && password) {
      const user = verifyUser(username, password);
      if (user) {
        setRole(user.role);
        setUserData(user);
      } else {
        console.error("Invalid credentials");
      }
    }
  }, [username, password]);

  const handleLogout = () => {
    setToken("");
    setRole("guest");
    setUserData(null);
    setUsername("");
    setPassword("");
  };

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={<Login setToken={setToken} setRole={setRole} setUsername={setUsername} setPassword={setPassword} />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Login setToken={setToken} setRole={setRole} setUsername={setUsername} setPassword={setPassword} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <FileProvider>
      <BrowserRouter>
        <div className="d-flex">
          {role !== "guest" && <Sidebar user={userData} onLogout={handleLogout} />}
          <div className="content-container">
            <Routes>
              <Route path="/" element={<Home role={role} />} />
              {role !== "guest" && (
                <>
                  <Route path="/administrator" element={<Administrator />} />
                  <Route path="/my-document" element={<MyDocument />} />
                  <Route path="/document" element={<Document />} />
                  <Route path="/permission" element={<Permission />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/addfilelist" element={<AddFileReport />} />
                  <Route path="/reports/removefilelist" element={<RemoveFileReport />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/profile" element={<Profile username={username} password={password} />} />
                </>
              )}
              <Route path="*" element={<Home role={role} />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </FileProvider>
  );
}

export default App;
