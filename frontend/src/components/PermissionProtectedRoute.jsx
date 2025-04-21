// src/components/PermissionProtectedRoute.jsx
import React from "react";

const PermissionProtectedRoute = ({ requiredPermission, children }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const permissions = userData?.permissions || [];

  const hasPermission = permissions.includes(requiredPermission);

  if (!hasPermission) {
    return (
      <div className="text-center text-danger fs-4 fw-bold mt-5">
        🚫 คุณไม่มีสิทธิ์เข้าถึงหน้านี้
      </div>
    );
  }

  return children;
};

export default PermissionProtectedRoute;
