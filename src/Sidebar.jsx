import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";

function Sidebar({ user }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation(); // ใช้ location เพื่อดู path ปัจจุบัน

  const isActive = (path) => location.pathname === path; // ตรวจสอบว่า path ตรงกับ URL ปัจจุบันหรือไม่

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  return (
    <div className="sidebar-container d-flex flex-column justify-content-between vh-100">
      {/* Logo Section */}
      <div className="logo-section mb-4">
        <Link
          to="/"
          className="text-decoration-none d-flex align-items-center mb-3"
        >
          <img
            src="/img/Logo2.png"
            alt="Logo"
            className="logo-image styled-logo"
          />
        </Link>
        <hr className="divider" />
      </div>

      {/* Menu Section */}
      <ul className="nav nav-pills flex-column mb-auto no-padding">
        <li className="nav-item p-1">
          <Link
            to="/"
            className={`nav-link sidebar-item ${isActive("/") ? "active" : ""}`}
          >
            <i className="bi bi-house me-2"></i> Home
          </Link>
        </li>

        {/* Administrator Dropdown */}
        <li className="nav-item p-1">
          <a
            href="#"
            className={`nav-link sidebar-item ${isActive("/administrator") ? "active" : ""}`}
            onClick={toggleDropdown}
          >
            <i className="bi bi-gear me-2"></i> Administrator
          </a>
          {isDropdownOpen && (
         <ul className="nav flex-column ms-3">
         <li className="nav-item p-1">
           <Link
             to="/my-document"
             className={`nav-link sidebar-item ${isActive("/my-document") ? "active" : ""}`}
           >
             <i className="bi bi-file-earmark-text"></i> My Document
           </Link>
         </li>
         <li className="nav-item p-1">
           <Link
             to="/document"
             className={`nav-link sidebar-item ${isActive("/document") ? "active" : ""}`}
           >
             <i className="bi bi-folder icon-adjust"></i> Document Management
           </Link>
         </li>
         <li className="nav-item p-1">
           <Link
             to="/permission"
             className={`nav-link sidebar-item ${isActive("/permission") ? "active" : ""}`}
           >
             <i className="bi bi-shield-lock icon-adjust"></i> Permission Management
           </Link>
         </li>
         <li className="nav-item p-1">
           <Link
             to="/reports"
             className={`nav-link sidebar-item ${isActive("/reports") ? "active" : ""}`}
           >
             <i className="bi bi-bar-chart"></i> Reports
           </Link>
         </li>
       </ul>
       
        
          )}
        </li>

        <li className="nav-item p-1">
          <Link
            to="/help"
            className={`nav-link sidebar-item ${isActive("/help") ? "active" : ""}`}
          >
            <i className="bi bi-question-circle me-2"></i> Help
          </Link>
        </li>
      </ul>

      {/* Footer Section */}
      <div className="footer-section mt-auto">
        <hr className="divider" />
        <Link
          to="/profile"
          className="footer-link d-flex align-items-center justify-content-between text-decoration-none"
        >
          <div className="user-info d-flex align-items-center ms-auto">
            <span className="user-name">
              {user ? `${user.firstName} ${user.lastName}` : "User Name"}
            </span>
          </div>
          <img
            src={user?.avatar || "/img/default-avatar.png"}
            alt="Profile"
            className="footer-profile-image"
          />
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
