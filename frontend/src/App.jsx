import { useState } from "react";
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
import AboutMe from "./components/Aboutme/Aboutme";

import { FileProvider } from "./components/FileContext/FileContext";

import "./App.css";

function App() {
  const [role, setRole] = useState(
    localStorage.getItem("userData")
      ? JSON.parse(localStorage.getItem("userData")).role
      : "guest"
  );
  const [userData, setUserData] = useState(
    localStorage.getItem("userData")
      ? JSON.parse(localStorage.getItem("userData"))
      : null
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogout = () => {
    setRole("guest");
    setUserData(null);
    setUsername("");
    setPassword("");
    localStorage.removeItem("userData"); // Remove user data from localStorage
  };

  return (
    <FileProvider>
      <div className="d-flex">
        {role !== "guest" && <Sidebar user={userData} onLogout={handleLogout} />}
        <div className="content-container">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Home role={role} />} />
            <Route path="/login" element={<Login setRole={setRole} setUsername={setUsername} setPassword={setPassword} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
                <Route path="/about-me" element={<AboutMe />} />
              </>
            )}
            <Route path="/aboutme" element={<AboutMe role={role} />} />
          </Routes>
        </div>
      </div>
    </FileProvider>
  );
}

export default App;