import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="sidebar-container">
      {/* Logo Section */}
      <div className="logo-section">
        <Link to="/" className="logo-link">
          <img src="/img/Logo2.png" alt="Logo" className="logo-image" />
        </Link>
      </div>

      {/* Menu Section */}
      <ul className="sidebar-menu">
        <li className="menu-item">
          <Link to="/" className={`sidebar-item ${isActive("/") ? "active" : ""}`}>
          <i class="fi fi-rr-home"></i> Home
          </Link>
        </li>

        {/* แยกไอเท็ม Administrator ออกมาเป็นเมนูหลัก */}
        <li className="menu-item">
          <Link
            to="/my-document"
            className={`sidebar-item ${isActive("/my-document") ? "active" : ""}`}
          >
            <i class="fi fi-rr-document"></i> Document
          </Link>
        </li>
        {/* <li className="menu-item">
          <Link
            to="/document"
            className={`sidebar-item ${isActive("/document") ? "active" : ""}`}
          >
            <span className="icon">📁</span> Document Management
          </Link>
        </li> */}
        <li className="menu-item">
          <Link
            to="/approve"
            className={`sidebar-item ${isActive("/approve") ? "active" : ""}`}
          >
            <i class="fi fi-rr-registration-paper"></i> Approve
          </Link>
        </li>
        <li className="menu-item">
          <Link
            to="/permission"
            className={`sidebar-item ${isActive("/permission") ? "active" : ""}`}
          >
            <i class="fi fi-rr-users-alt"></i> Permission Management
          </Link>
        </li>
        <li className="menu-item">
          <Link
            to="/reports"
            className={`sidebar-item ${isActive("/reports") ? "active" : ""}`}
          >
            <i class="fi fi-rr-newspaper"></i> Reports
          </Link>
        </li>
        <li className="menu-item">
          <Link
            to="/about-me"
            className={`sidebar-item ${isActive("/about-me") ? "active" : ""}`}
          >
            <i class="fi fi-rr-info"></i> About Me
          </Link>
        </li>
        <li className="menu-item">
          <Link
            to="/help"
            className={`sidebar-item ${isActive("/help") ? "active" : ""}`}
          >
            <i class="fi fi-rr-interrogation"></i> Help
          </Link>
        </li>
      </ul>

      {/* Footer Section */}
      <div className="sidebar-footer">
        <hr className="divider" />
        <Link to="/profile" className="footer-link">
          <span className="user-name">
            {user ? `${user.firstName} ${user.lastName}` : "User Name"}
          </span>
          {/* <img
            src={user?.avatar || "/img/default-avatar.png"}
            alt="Profile"
            className="footer-profile-image"
          /> */}
        </Link>
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;