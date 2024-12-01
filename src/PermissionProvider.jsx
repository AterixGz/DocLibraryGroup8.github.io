import React, { createContext, useContext, useState, useEffect } from "react";

// สร้าง Context สำหรับจัดการสิทธิ์
const PermissionContext = createContext();

// Hook สำหรับใช้งาน Context
export const usePermission = () => {
  return useContext(PermissionContext);
};

// Provider Component สำหรับจัดการสิทธิ์
export const PermissionProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ฟังก์ชันสำหรับดึงข้อมูลสิทธิ์ของผู้ใช้ที่ล็อกอิน
    const fetchUserPermissions = () => {
      // อ่านข้อมูลผู้ใช้จาก localStorage
      const user = JSON.parse(localStorage.getItem("currentUser"));
      
      // ถ้ามีผู้ใช้ ให้ตั้งค่าข้อมูลสิทธิ์
      if (user) {
        setUserPermissions({
          documentAccess: user.documentAccess || false,
          permissionAccess: user.permissionAccess || false,
          reportsAccess: user.reportsAccess || false,
        });
      } else {
        // ถ้าไม่มีผู้ใช้ ให้ตั้งค่าข้อมูลสิทธิ์เป็นค่าเริ่มต้น
        setUserPermissions({
          documentAccess: false,
          permissionAccess: false,
          reportsAccess: false,
        });
      }

      // เสร็จสิ้นการโหลด
      setIsLoading(false);
    };

    fetchUserPermissions();
  }, []);

  // กรณียังโหลดข้อมูลอยู่ ให้แสดง placeholder
  if (isLoading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <PermissionContext.Provider value={{ userPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};
