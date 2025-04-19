import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
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
import Trash from "./components/Trash/Trash";

import { FileProvider } from "./components/FileContext/FileContext";
import { AuthProvider, AuthContext } from "./contexts/AuthContext.jsx";

import "./App.css";

function AppRoutes() {
  const { role, username, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="d-flex">
      {role !== "guest" && (
        <Sidebar user={{ username, role }} onLogout={handleLogout} />
      )}
      <div className="content-container">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
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
              <Route path="/profile" element={<Profile username={username} />} />
              <Route path="/about-me" element={<AboutMe />} />
              <Route path="/trash" element={<Trash />} />
            </>
          )}
          <Route path="/aboutme" element={<AboutMe />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FileProvider>
        <AppRoutes />
      </FileProvider>
    </AuthProvider>
  );
}

export default App;