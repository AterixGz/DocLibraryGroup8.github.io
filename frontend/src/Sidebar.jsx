import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    onLogout();
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const permissions = user?.permissions || [];

  const hasPermission = (perm) => permissions.includes(perm);

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
        {hasPermission("document_access") && (
          <li className="menu-item">
            <Link
              to="/"
              className={`sidebar-item ${isActive("/") ? "active" : ""}`}
            >
              <i className="fi fi-rr-home"></i> Home
            </Link>
          </li>
        )}

        {hasPermission("document_manage") && (
          <>
            <li className="menu-item">
              <Link
                to="/my-document"
                className={`sidebar-item ${isActive("/my-document") ? "active" : ""}`}
              >
                <i className="fi fi-rr-document"></i> Document
              </Link>
            </li>
            <li className="menu-item">
              <Link
                to="/trash"
                className={`sidebar-item ${isActive("/trash") ? "active" : ""}`}
              >
                <i className="fi fi-rr-trash"></i> Trash
              </Link>
            </li>
          </>
        )}

        {hasPermission("document_approve") && (
          <li className="menu-item">
            <Link
              to="/approve"
              className={`sidebar-item ${isActive("/approve") ? "active" : ""}`}
            >
              <i className="fi fi-rr-registration-paper"></i> Approve
            </Link>
          </li>
        )}

        {hasPermission("user_admin") && (
          <li className="menu-item">
            <Link
              to="/permission"
              className={`sidebar-item ${isActive("/permission") ? "active" : ""}`}
            >
              <i className="fi fi-rr-users-alt"></i> Permission Management
            </Link>
          </li>
        )}

        {hasPermission("report_access") && (
          <li className="menu-item">
            <Link
              to="/reports"
              className={`sidebar-item ${isActive("/reports") ? "active" : ""}`}
            >
              <i className="fi fi-rr-newspaper"></i> Reports
            </Link>
          </li>
        )}

        {/* เมนูทั่วไปที่ไม่ต้องใช้ permission */}
        <li className="menu-item">
          <Link
            to="/about-me"
            className={`sidebar-item ${isActive("/about-me") ? "active" : ""}`}
          >
            <i className="fi fi-rr-info"></i> About Me
          </Link>
        </li>
        <li className="menu-item">
          <Link
            to="/help"
            className={`sidebar-item ${isActive("/help") ? "active" : ""}`}
          >
            <i className="fi fi-rr-interrogation"></i> Help
          </Link>
        </li>
      </ul>

      {/* Footer Section */}
      <div className="sidebar-footer">
        <hr className="divider" />
        <Link to="/profile" className="footer-link">
          <span className="user-name">
            {user ? `${user.first_name} ${user.last_name}` : "User Name"}
          </span>
        </Link>
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
