import React, { useState, useEffect, useRef } from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import "./Permission.css";

function PermissionManagement() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const role = userData?.role || 'guest';

  // ลบการตรวจสอบสิทธิ์ออก
  // if (role !== "admin") {
  //   return (
  //     <div className="permission-management__container">
  //       <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้!</p>
  //     </div>
  //   );
  // }

  const [userList, setUserList] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    department: "",
    employeeId: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [progress, setProgress] = useState(0);
  const alertShown = useRef(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // ดึงข้อมูลผู้ใช้
        const usersResponse = await fetch("http://localhost:3000/api/users");
        const usersData = await usersResponse.json();
        
        let permissionsData = [];
        
        try {
          // แยกการดึงข้อมูลสิทธิ์ออกมาในบล็อก try/catch แยก
          const permissionsResponse = await fetch("http://localhost:3000/api/permission");
          const permissionsResult = await permissionsResponse.json();
          console.log("Permissions data:", permissionsResult);
          
          // ถ้าสำเร็จ ให้ใช้ข้อมูลที่ได้มา
          if (!permissionsResult.error) {
            permissionsData = Array.isArray(permissionsResult) 
              ? permissionsResult 
              : (permissionsResult.data || []);
          }
        } catch (permErr) {
          console.error("Error fetching permissions:", permErr);
          // ไม่ต้อง alert ตรงนี้ เพื่อให้โค้ดทำงานต่อได้
        }
        
        // รวมข้อมูลผู้ใช้กับสิทธิ์ แม้ว่าจะไม่มีข้อมูลสิทธิ์ก็ตาม
        const mergedData = usersData.map(user => {
          const userPermissions = permissionsData.find(p => p.employee_id === user.employee_id) || {};
          return {
            ...user,
            documentAccess: userPermissions.documentAccess || false,
            permissionAccess: userPermissions.permissionAccess || false,
            reportsAccess: userPermissions.reportsAccess || false,
          };
        });
        
        setUserList(mergedData);
        setFilteredUsers(mergedData);
      } catch (error) {
        console.error("Error in fetchUsers:", error);
        alert(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}`);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(
      userList.filter(
        (user) =>
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term)
      )
    );
  };

  // const handleTogglePermission = (index, permission) => {
  //   const updatedUsers = [...filteredUsers];
  //   updatedUsers[index][permission] = !updatedUsers[index][permission];
  //   setFilteredUsers(updatedUsers);

  //   const userIndex = userList.findIndex(
  //     (user) => user.username === updatedUsers[index].username
  //   );
  //   if (userIndex !== -1) {
  //     const updatedOriginalUsers = [...userList];
  //     updatedOriginalUsers[userIndex][permission] =
  //       updatedUsers[index][permission];
  //     setUserList(updatedOriginalUsers);
  //   }
  // };

  const handleTogglePermission = async (index, permissionKey) => {
    try {
    const updatedValue = !filteredUsers[index][permissionKey];
    
    // แปลงชื่อ permission เป็นรูปแบบที่ถูกต้อง
    const permissionMapping = {
      "documentAccess": "document_access",
      "permissionAccess": "permission_access",
      "reportsAccess": "reports_access"
    };

    const updatedUsers = [...filteredUsers];
    updatedUsers[index] = {
      ...updatedUsers[index],
      [permissionKey]: updatedValue
    };
    setFilteredUsers(updatedUsers);
  
      const response = await fetch('http://localhost:3000/api/permission', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: filteredUsers[index].employee_id,
          permissionName: permissionMapping[permissionKey],
          value: updatedValue,
        }),
      });
      
      if (!response.ok) {
        // ถ้าไม่สำเร็จให้กลับไปใช้ค่าเดิม
        updatedUsers[index][permissionKey] = !updatedValue;
        setFilteredUsers([...updatedUsers]);
        
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || errorData.error || 'Unknown error');
      }
      
    } catch (error) {
      console.error('Error toggling permission:', error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  
    //   // อัพเดต UI ตามผลลัพธ์
    //   const updatedUsers = [...filteredUsers];
    //   updatedUsers[index][permissionKey] = updatedValue;
    //   setFilteredUsers(updatedUsers);
    // } catch (error) {
    //   console.error('Error updating permission:', error.message);
    // }
  };


  const handleConfirmUpdate = () => {
    setLoading(true);
    let progressInterval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(progressInterval);
          setLoading(false);
          if (!alertShown.current) {
            alert("สิทธิ์การเข้าถึงได้รับการอัปเดตเรียบร้อยแล้ว!");
            alertShown.current = true;
          }
          console.log("Updated User List:", userList);
        }
        return Math.min(oldProgress + 10, 100);
      });
    }, 200);
  };

  const handleAddUser = () => setShowAddUserModal(true);

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    const updatedUserList = userList.filter(
      (user) => user.username !== selectedUser.username
    );
    const updatedFilteredUsers = filteredUsers.filter(
      (user) => user.username !== selectedUser.username
    );

    setUserList(updatedUserList);
    setFilteredUsers(updatedFilteredUsers);
    setShowDeletePopup(false);
  };

  const handleAddNewUser = () => {
    const newUserData = {
      ...newUser,
      documentAccess: true,
      permissionAccess: false,
      reportsAccess: false,
    };
    setUserList([...userList, newUserData]);
    setFilteredUsers([...filteredUsers, newUserData]);
    setShowAddUserModal(false);
    setNewUser({
      firstName: "",
      lastName: "",
      username: "",
      employeeId: "",
    });
  };

  const handleCloseModal = () => {
    setShowAddUserModal(false);
  };
  
  return (
    <div className="permission-management__container">
      <h2 className="permission-management__header">จัดการสิทธิ์ในการเข้าถึง</h2>

      <AnimatePresence>
        {loading && (
          <m.div
            className="loading-bar"
            style={{ width: `${progress}%` }}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 25 }}
          />
        )}
      </AnimatePresence>

      <div className="permission-management__controls">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="ค้นหาผู้ใช้..."
          className="permission-management__search-input"
        />
        <button
          onClick={handleAddUser}
          className="permission-management__add-user-btn"
        >
          เพิ่มพนักงาน
        </button>
      </div>

      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-header">เพิ่มพนักงาน</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddNewUser();
              }}
              className="modal-form"
            >
              {["first_name", "last_name", "department", "employeeId"].map((field) => {
                  const labelText =
                    field === "first_name"
                      ? "ชื่อ "
                      : field === "last_name"
                      ? "นามสกุล "
                      : field === "department"
                      ? "แผนกที่สังกัด "
                      : "รหัสพนักงาน ";

                  return (
                    <div className="form-group" key={field}>
                      <label className="form-label" htmlFor={field}>
                        {labelText}:
                      </label>
                      <input
                        id={field}
                        type="text"
                        value={newUser[field]}
                        onChange={(e) => setNewUser({ ...newUser, [field]: e.target.value })}
                        required
                        className="form-input"
                        placeholder={`กรอก${labelText}`}
                      />
                    </div>
                  );
                })}
                

              <div className="modal-actions">
                <button type="submit" className="btn btn-save">บันทึก</button>
                <button type="button" onClick={handleCloseModal} className="btn btn-cancel">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* <div className="permission-management">
        <h1>จัดการสิทธิ์การใช้งาน</h1>
        <p>{role}</p>
      </div> */}

      <div className="permission-management__table-container">
        <table className="permission-management__table">
          <thead>
            <tr>
              <th>บุคลากร</th>
              <th>แผนก</th>
              <th>รหัสพนักงาน</th>
              <th>Document</th>
              <th>Permission</th>
              <th>Reports</th>
              <th></th>
            </tr>
          </thead>
          </table>
          <div className="permission-management__tbody-container">
          <table className="permission-management__table">
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.username}>
                <td>{`${user.first_name} ${user.last_name}`}</td>
                <td>{user.department}</td>
                <td>{user.employee_id}</td>
                {["documentAccess", "permissionAccess", "reportsAccess"].map((perm) => (
                  <td key={perm}>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id={`${perm}-${user.employee_id}`}
                        checked={user[perm]}
                        onChange={() => handleTogglePermission(index, perm)}
                      />
                      <label htmlFor={`${perm}-${user.employee_id}`}></label>
                    </div>
                  </td>
                ))}
                <td>
                  <button className="custom-btn-danger" onClick={() => handleDelete(user)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    
    <button
        onClick={() => setShowSavePopup(true)}
        className="permission-management__confirm-btn"
        disabled={loading}
      >
        {loading ? "กำลังโหลด..." : "ยืนยัน"}
      </button>

      {/* เพิ่ม Modal Popup สำหรับการบันทึก */}
      {showSavePopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>ยืนยันการบันทึก</h3>
            <p>คุณต้องการยืนยันการบันทึก ใช่หรือไม่?</p>
            <div className="modal-actions">
              <button 
                onClick={() => {
                  handleConfirmUpdate();
                  setShowSavePopup(false);
                }} 
                className="btn custom-btn-danger"
              >
                ยืนยัน
              </button>
              <button
                onClick={() => setShowSavePopup(false)}
                className="btn btn-cancel"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>ยืนยันการลบ</h3>
            <p>คุณต้องการลบผู้ใช้นี้ใช่ไหม?</p>
            <div className="modal-actions">
              <button onClick={handleConfirmDelete} className="btn custom-btn-danger">
                ยืนยัน
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="btn btn-cancel"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PermissionManagement;