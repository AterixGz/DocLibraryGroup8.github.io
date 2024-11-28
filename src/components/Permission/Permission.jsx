import React, { useState, useEffect } from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import "./Permission.css";
import users from "../../data/users";

function PermissionManagement() {
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
    employeeId: "",
  });

  // Effect to initialize users
  useEffect(() => {
    setUserList(users);
    setFilteredUsers(users);
  }, []);

  // Handle search
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

  // Handle permission toggle (Document, Permission, Reports)
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

  // Confirm update permissions
  const handleConfirmUpdate = () => {
    alert("สิทธิ์การเข้าถึงได้รับการอัปเดตเรียบร้อยแล้ว!");
    console.log("Updated User List:", userList);
  };

  // Open add user modal
  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  // Handle delete user
  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeletePopup(true);
  };

  // Confirm delete user
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

  // Handle add new user
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

  // Close modal
  const handleCloseModal = () => {
    setShowAddUserModal(false);
  };

  return (
    <div className="permission-management__container">
      <h2 className="permission-management__header">
        จัดการสิทธิ์ในการเข้าถึง
      </h2>

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

      {/* Add User Modal */}
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
        <div className="form-group-group">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              ชื่อ :
              <input
                type="text"
                id="firstName"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
                required
                className="form-input"
                placeholder="กรอกชื่อ"
              />
            </label>
            
            <label htmlFor="lastName" className="form-label">
              นามสกุล :
              <input
                type="text"
                id="lastName"
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
                required
                className="form-input"
                placeholder="กรอกนามสกุล"
              />
            </label>
          </div>
          <div className="form-group">
           
          </div>
        </div>

        <div className="form-group-group">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              ชื่อผู้ใช้ :
              <input
                type="text"
                id="username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                required
                className="form-input"
                placeholder="กรอกชื่อผู้ใช้"
              />
            </label>
            <label htmlFor="employeeId" className="form-label">
              รหัสพนักงาน :
              <input
                type="text"
                id="employeeId"
                value={newUser.employeeId}
                onChange={(e) =>
                  setNewUser({ ...newUser, employeeId: e.target.value })
                }
                required
                className="form-input"
                placeholder="กรอกรหัสพนักงาน"
              />
            </label>
          </div>
          <div className="form-group">
           
          </div>
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-save">
            บันทึก
          </button>
          <button
            type="button"
            onClick={handleCloseModal}
            className="btn btn-cancel"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* User Table */}
      <div className="permission-management__table-container">
        <table className="permission-management__table">
          <thead>
            <tr>
              <th>บุคลากร</th>
              <th>รหัสพนักงาน</th>
              <th>Document</th>
              <th>Permission</th>
              <th>Reports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.username}>
                <td>{`${user.firstName} ${user.lastName}`}</td>
                <td>{user.employeeId}</td>
                <td>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id={`documentAccess-${index}`}
                      checked={user.documentAccess}
                      onChange={() =>
                        handleTogglePermission(index, "documentAccess")
                      }
                    />
                    <label htmlFor={`documentAccess-${index}`}></label>
                  </div>
                </td>
                <td>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id={`permissionAccess-${index}`}
                      checked={user.permissionAccess}
                      onChange={() =>
                        handleTogglePermission(index, "permissionAccess")
                      }
                    />
                    <label htmlFor={`permissionAccess-${index}`}></label>
                  </div>
                </td>
                <td>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id={`reportsAccess-${index}`}
                      checked={user.reportsAccess}
                      onChange={() =>
                        handleTogglePermission(index, "reportsAccess")
                      }
                    />
                    <label htmlFor={`reportsAccess-${index}`}></label>
                  </div>
                </td>
                <td>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(user)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Update Button */}
      <button
        onClick={handleConfirmUpdate}
        className="permission-management__confirm-btn"
      >
        ยืนยัน
      </button>

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>ยืนยันการลบ</h3>
            <p>คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?</p>
            <div className="modal-actions">
              <button onClick={handleConfirmDelete} className="delete-btn">
                ยืนยัน
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="cancel-btn"
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
