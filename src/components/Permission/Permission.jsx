import React, { useState, useEffect } from "react";
import Switch from "react-switch";
import { motion as m, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast notifications
import "./Permission.css";
import users from "../../data/users";
import "./Permission.css";

function PermissionManagement() {
  // State Management
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

  // Fetch Initial User List
  useEffect(() => {
    setUserList(users);
    setFilteredUsers(users);
  }, []);

  // Event Handlers
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

    // Update main user list
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
    // Display a success toast notification
    toast.success("สิทธิ์การเข้าถึงได้รับการอัปเดตเรียบร้อยแล้ว!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    console.log("Updated User List:", userList);
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
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

  // Add User Modal Handlers
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

      {/* Search and Add User Section */}
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

      {/* User List Table */}
      <div className="permission-management__table-container">
        <table className="permission-management__table">
          <thead>
            <tr>
              <th>ชื่อ</th>
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
                  <Switch
                    checked={user.documentAccess}
                    onChange={() =>
                      handleTogglePermission(index, "documentAccess")
                    }
                  />
                </td>
                <td>
                  <Switch
                    checked={user.permissionAccess}
                    onChange={() =>
                      handleTogglePermission(index, "permissionAccess")
                    }
                  />
                </td>
                <td>
                  <Switch
                    checked={user.reportsAccess}
                    onChange={() =>
                      handleTogglePermission(index, "reportsAccess")
                    }
                  />
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="permission-management__delete-btn"
                  >
                    ลบ
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
              <div className="form-group name-group">
                <div className="form-item">
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

                <div className="form-item">
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
                  onClick={() => setShowAddUserModal(false)}
                  className="cancel-btn"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      <AnimatePresence>
        {showDeletePopup && (
          <div
            className="popup-overlay"
            onClick={() => setShowDeletePopup(false)}
          >
            <m.div
              className="popup-content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <h3>ยืนยันการลบ</h3>
              <p>
                คุณต้องการลบผู้ใช้งาน <strong>{selectedUser?.firstName}</strong>{" "}
                ใช่หรือไม่?
              </p>
              <button onClick={handleConfirmDelete} className="confirm-btn">
                ยืนยัน
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="cancel-btn"
              >
                ยกเลิก
              </button>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}

export default PermissionManagement;
