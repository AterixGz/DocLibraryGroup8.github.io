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
import ApprovePage from "./components/Approve/ApprovePage.jsx";

import { FileProvider } from "./components/FileContext/FileContext";
import { AuthProvider, AuthContext } from "./contexts/AuthContext.jsx";
import PermissionProtectedRoute from "./components/PermissionProtectedRoute";

import "./App.css";

function AppRoutes() {
  const { role, username, logout, userData } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="d-flex">
      {userData && userData.role !== "guest" && (
        <Sidebar user={userData} onLogout={handleLogout} />
      )}
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={
            <PermissionProtectedRoute requiredPermission="document_access">
              <Home />
            </PermissionProtectedRoute>
          } />

          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ✅ เฉพาะเมื่อ login แล้ว */}
          {role !== "guest" && (
            <>
              <Route path="/administrator" element={<Administrator />} />

              <Route path="/my-document" element={
                <PermissionProtectedRoute requiredPermission="document_manage">
                  <MyDocument />
                </PermissionProtectedRoute>
              } />

              <Route path="/document" element={
                <PermissionProtectedRoute requiredPermission="document_manage">
                  <Document />
                </PermissionProtectedRoute>
              } />

              <Route path="/trash" element={
                <PermissionProtectedRoute requiredPermission="document_manage">
                  <Trash />
                </PermissionProtectedRoute>
              } />

              <Route path="/approve" element={
                <PermissionProtectedRoute requiredPermission="document_approve">
                  <ApprovePage />
                </PermissionProtectedRoute>
              } />

              <Route path="/permission" element={
                <PermissionProtectedRoute requiredPermission="user_admin">
                  <Permission />
                </PermissionProtectedRoute>
              } />

              <Route path="/reports" element={
                <PermissionProtectedRoute requiredPermission="report_access">
                  <Reports />
                </PermissionProtectedRoute>
              } />

              <Route path="/reports/addfilelist" element={
                <PermissionProtectedRoute requiredPermission="report_access">
                  <AddFileReport />
                </PermissionProtectedRoute>
              } />

              <Route path="/reports/removefilelist" element={
                <PermissionProtectedRoute requiredPermission="report_access">
                  <RemoveFileReport />
                </PermissionProtectedRoute>
              } />

              <Route path="/help" element={<Help />} />
              <Route path="/profile" element={<Profile username={username} />} />
              <Route path="/about-me" element={<AboutMe />} />
            </>
          )}

          {/* สำหรับ fallback */}
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
