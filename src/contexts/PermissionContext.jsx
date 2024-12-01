import React, { createContext, useContext, useState, useEffect } from "react";

// สร้าง Context สำหรับจัดการสิทธิ์
const PermissionContext = createContext();

// ฟังก์ชันสำหรับใช้ Context
export const usePermission = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ฟังก์ชันที่จะดึงข้อมูลผู้ใช้ที่ล็อกอิน
    const fetchUserPermissions = () => {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      if (user) {
        setUserPermissions({
          documentAccess: user.documentAccess,
          permissionAccess: user.permissionAccess,
          reportsAccess: user.reportsAccess,
        });
      } else {
        setUserPermissions({
          documentAccess: false,
          permissionAccess: false,
          reportsAccess: false,
        });
      }
      setIsLoading(false); // โหลดเสร็จแล้ว
    };

    fetchUserPermissions();
  }, []);

  // ถ้ายังโหลดอยู่ ให้แสดง fallback หรือ return null
  if (isLoading) {
    return <div>Loading permissions...</div>; // หรือ placeholder ที่เหมาะสม
  }

  return (
    <PermissionContext.Provider value={{ userPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};
