import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    toast.success("สิทธิ์การเข้าถึงได้รับการอัปเดตเรียบร้อยแล้ว!");
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleCloseModal = () => {
    setShowAddUserModal(false);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    setUserList(
      userList.filter((user) => user.username !== selectedUser.username)
    );
    setFilteredUsers(
      filteredUsers.filter((user) => user.username !== selectedUser.username)
    );
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

      {/* Modal สำหรับเพิ่มพนักงาน */}
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
              <div className="form-group">
                <label htmlFor="firstName">ชื่อ:</label>
                <input
                  type="text"
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">นามสกุล:</label>
                <input
                  type="text"
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">ชื่อผู้ใช้:</label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="employeeId">รหัสพนักงาน:</label>
                <input
                  type="text"
                  id="employeeId"
                  value={newUser.employeeId}
                  onChange={(e) =>
                    setNewUser({ ...newUser, employeeId: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-btn"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <td className="align-center">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.documentAccess}
                      onChange={() =>
                        handleTogglePermission(index, "documentAccess")
                      }
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td className="align-center">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.permissionAccess}
                      onChange={() =>
                        handleTogglePermission(index, "permissionAccess")
                      }
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td className="align-center">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.reportsAccess}
                      onChange={() =>
                        handleTogglePermission(index, "reportsAccess")
                      }
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteUser(user)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleConfirmUpdate}
        className="permission-management__confirm-btn"
      >
        ยืนยัน
      </button>

      <ToastContainer />
    </div>
  );
}

export default PermissionManagement;
