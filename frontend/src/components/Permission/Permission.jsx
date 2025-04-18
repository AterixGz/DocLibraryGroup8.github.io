import React, { useState, useEffect, useRef } from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import "./Permission.css";
import users from "../../data/users";

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
  const [progress, setProgress] = useState(0);
  const alertShown = useRef(false);

  useEffect(() => {
    setUserList(users);
    setFilteredUsers(users);
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

  const handleTogglePermission = (index, permission) => {
    const updatedUsers = [...filteredUsers];
    updatedUsers[index][permission] = !updatedUsers[index][permission];
    setFilteredUsers(updatedUsers);

    const userIndex = userList.findIndex(
      (user) => user.username === updatedUsers[index].username
    );
    if (userIndex !== -1) {
      const updatedOriginalUsers = [...userList];
      updatedOriginalUsers[userIndex][permission] =
        updatedUsers[index][permission];
      setUserList(updatedOriginalUsers);
    }
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
              {["firstName", "lastName", "username", "employeeId"].map((field) => (
                <div className="form-group" key={field}>
                  <label className="form-label">
                    {field === "firstName"
                      ? "ชื่อ"
                      : field === "lastName"
                      ? "นามสกุล"
                      : field === "username"
                      ? "ชื่อผู้ใช้"
                      : "รหัสพนักงาน"}{" "}
                    :
                    <input
                      type="text"
                      value={newUser[field]}
                      onChange={(e) =>
                        setNewUser({ ...newUser, [field]: e.target.value })
                      }
                      required
                      className="form-input"
                      placeholder={`กรอก${field}`}
                    />
                  </label>
                </div>
              ))}

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
              <td>{`${user.firstName} ${user.lastName}`}</td>
              <td>{`${user.department}`}</td>
              <td>{user.employeeId}</td>
              {["documentAccess", "permissionAccess", "reportsAccess"].map((perm) => (
                <td key={perm}>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id={`${perm}-${index}`}
                      checked={user[perm]}
                      onChange={() => handleTogglePermission(index, perm)}
                    />
                    <label htmlFor={`${perm}-${index}`}></label>
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
        onClick={handleConfirmUpdate}
        className="permission-management__confirm-btn"
        disabled={loading}
      >
        {loading ? "กำลังโหลด..." : "ยืนยัน"}
      </button>

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