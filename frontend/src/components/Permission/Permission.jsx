// ✅ PermissionPage.jsx - Full Updated Version
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./Permission.css";
import { FiMoreVertical } from "react-icons/fi";
import { AuthContext } from "../../contexts/AuthContext";

const PermissionPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState("members");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [nextEmpId, setNextEmpId] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [editUser, setEditUser] = useState({});
  const [showEditForm, setShowEditForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editPassword, setEditPassword] = useState("");
  const { userData, setUserData } = useContext(AuthContext);

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    role_id: "",
    employee_id: "",
  });

  const token = localStorage.getItem("token");
  const currentUserId = JSON.parse(localStorage.getItem("userData"))?.id;

  useEffect(() => {
    if (!token) return;
    fetchRoles();
    fetchPermissions();
    fetchDepartments();
  }, [token]);

  // ✅ fetch users หลัง roles โหลดเสร็จ
  useEffect(() => {
    if (roles.length > 0) {
      fetchUsers(); // <-- ตอนนี้ roles มีแล้ว
    }
  }, [roles]); // <-- ทำงานเมื่อ roles เปลี่ยน

  useEffect(() => {
    if (users.length > 0) {
      const prefix = "EMP";
      const maxId = users.reduce((max, user) => {
        const match = user.employee_id?.match(/^EMP(\d+)$/);
        const num = match ? parseInt(match[1]) : 0;
        return Math.max(max, num);
      }, 0);

      const nextNum = maxId + 1;
      const nextEmpId = `${prefix}${String(nextNum).padStart(3, "0")}`;
      setNextEmpId(nextEmpId);
      setNewUser((prev) => ({ ...prev, employee_id: nextEmpId }));
    }
  }, [users]);

  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roleList = Array.isArray(res.data) ? res.data : [];
      setRoles(roleList);

      const all = {};
      await Promise.all(
        roleList.map(async (role) => {
          const rp = await axios.get(
            `http://localhost:3000/api/roles/${role.id}/permissions`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const permList = Array.isArray(rp.data) ? rp.data : [];
          all[role.id] = permList.map((p) => p.name);
        })
      );

      setRolePermissions(all);
    } catch (err) {
      console.error("Error fetching roles/permissions:", err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermissions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching permissions:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = Array.isArray(res.data)
        ? res.data.sort((a, b) => {
            const aNum = parseInt(a.employee_id?.replace(/^EMP/, "")) || 0;
            const bNum = parseInt(b.employee_id?.replace(/^EMP/, "")) || 0;
            return aNum - bNum;
          })
        : [];

      // 🔄 แปลง role_id เป็นชื่อจาก roles
      const updated = sorted.map((user) => {
        const matchedRole = roles.find((r) => r.id === user.role_id);
        return { ...user, role_name: matchedRole?.name || user.role_id };
      });

      setUsers(updated);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const togglePermission = (roleId, permissionName) => {
    const current = rolePermissions[roleId] || [];
    const updated = current.includes(permissionName)
      ? current.filter((p) => p !== permissionName)
      : [...current, permissionName];
    setRolePermissions((prev) => ({ ...prev, [roleId]: updated }));
  };

  const getRoleLabel = (roleName) => {
    if (typeof roleName !== "string") return roleName;
    const role = roleName.toLowerCase();
    const classMap = {
      admin: "role-label-admin",
      manager: "role-label-manager",
      worker: "role-label-worker",
      guest: "role-label-guest",
    };

    return (
      <span className={`role-label ${classMap[role] || "role-label-default"}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const handleEditSubmit = async () => {
    try {
      const updatedUser = { ...editUser };
      if (editPassword.trim()) {
        updatedUser.password = editPassword;
      }
      await axios.put(
        `http://localhost:3000/api/users/${editUser.id}`,
        updatedUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showNotification("✅ แก้ไขข้อมูลสําเร็จ", "success");
      setShowEditForm(null);
      setEditPassword("");
      fetchUsers();
    } catch (err) {
      console.error("❌ Error updating user:", err.response?.data || err);
      showNotification("❌ แก้ไขข้อมูลไม่สำเร็จ", "error");
    }
  };

  const deleteUser = async (userId) => {
    if (userId === currentUserId) {
      return showNotification(
        "❌ ไม่สามารถลบผู้ใช้ที่กำลังใช้งานอยู่ได้",
        "error"
      );
    }
    try {
      await axios.delete(`http://localhost:3000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotification("✅ ลบผู้ใช้สำเร็จ", "success");
      setShowConfirmDelete(null);
      fetchUsers();
    } catch (err) {
      showNotification("❌ ลบผู้ใช้ไม่สำเร็จ", "error");
    }
  };

  const saveChanges = async () => {
    try {
      for (let role of roles) {
        await axios.post(
          `http://localhost:3000/api/roles/${role.id}/permissions`,
          { permissions: rolePermissions[role.id] || [] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // ✅ อัปเดต permission ใหม่ของผู้ใช้ปัจจุบัน
      const permRes = await axios.get(
        `http://localhost:3000/api/users/${userData.id}/permissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedUser = {
        ...userData,
        permissions: permRes.data,
      };

      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setUserData(updatedUser); // 🔁 อัปเดต context

      showNotification("✅ Permissions updated successfully", "success");
    } catch (err) {
      console.error("Failed to update permissions:", err);
      showNotification("❌ Failed to update permissions", "error");
    }
  };

  const handleCreateUser = async () => {
    const {
      username,
      password,
      first_name,
      last_name,
      email,
      department,
      role_id,
      employee_id,
    } = newUser;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !username ||
      !password ||
      !first_name ||
      !last_name ||
      !email ||
      !department ||
      !role_id
    ) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("กรุณากรอกอีเมลให้ถูกต้อง เช่น example@email.com");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/users/create", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotification("✅ สร้างผู้ใช้สำเร็จ", "success");
      setShowCreateForm(false);
      setNewUser({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        role_id: "",
        employee_id: "",
      });
      setErrorMessage("");
      fetchUsers();
    } catch (err) {
      console.error("❌ Error creating user:", err);
      showNotification("❌ สร้างผู้ใช้ไม่สำเร็จ", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="perm-page">
      <div className="perm-header">
        <h2>Permission Management</h2>
        <div className="perm-tabs">
          <div
            className={`perm-tab ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            Members
          </div>
          <div
            className={`perm-tab ${
              activeTab === "permissions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("permissions")}
          >
            Permissions
          </div>
        </div>
      </div>

      {activeTab === "permissions" && (
        <div className="perm-card">
          <div className="perm-card-header">
            <h3>Permission Roles</h3>
            <p>Configure permission roles for your organization.</p>
          </div>
          <div className="perm-table-scroll">
            <table className="perm-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  {roles.map((role) => (
                    <th key={role.id}>{role.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.name}>
                    <td>
                      <strong>{perm.name.replace(/_/g, " ")}</strong>
                      <div className="desc">{perm.description}</div>
                    </td>
                    {roles.map((role) => (
                      <td key={role.id}>
                        <label className="perm-switch">
                          <input
                            type="checkbox"
                            checked={
                              rolePermissions[role.id]?.includes(perm.name) ||
                              false
                            }
                            onChange={() =>
                              togglePermission(role.id, perm.name)
                            }
                          />
                          <span className="slider round"></span>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="perm-save-section">
            <button className="perm-save-btn" onClick={saveChanges}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="perm-card">
          <div className="perm-card-header">
            <h3>Members</h3>
            <p>List of current users in your organization.</p>
            <button
              className="perm-create-btn"
              onClick={() => setShowCreateForm(true)}
            >
              + เพิ่มผู้ใช้งาน
            </button>
          </div>
          <div className="perm-table-scroll">
            <table className="perm-member-table">
              <thead>
                <tr>
                  <th>EmpID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>เครื่องมือ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.employee_id}</td>
                    <td>
                      {user.first_name} {user.last_name}
                    </td>
                    <td>{user.email}</td>
                    <td>{getRoleLabel(user.role_name)}</td>
                    <td>{user.department}</td>
                    <td className="perm-action-cell">
                      <div className="perm-dropdown no-button-style">
                        <div>
                          <FiMoreVertical
                            style={{ cursor: "pointer" }}
                            size={20}
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === user.id ? null : user.id
                              )
                            }
                          />
                        </div>
                        {dropdownOpen === user.id && (
                          <div className="perm-dropdown-menu flat">
                            <button
                              onClick={() => {
                                setEditUser(user);
                                setShowEditForm(true);
                              }}
                            >
                              แก้ไข
                            </button>
                            <button onClick={() => setShowConfirmDelete(user)}>
                              ลบ
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateForm && (
        <>
          <div
            className="perm-modal-overlay"
            onClick={() => setShowCreateForm(false)}
          />
          <div className="perm-modal">
            <div className="perm-modal-header">
              <h3>เพิ่มผู้ใช้งานใหม่</h3>
              <button
                className="perm-modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <div className="perm-modal-body">
              {errorMessage && (
                <div className="perm-error-popup">{errorMessage}</div>
              )}
              <label>รหัสพนักงาน</label>
              <input value={newUser.employee_id} disabled readOnly />
              <label>ชื่อผู้ใช้</label>
              <input
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                placeholder="Username"
              />
              <label>รหัสผ่าน</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                placeholder="Password"
              />
              <label>ชื่อจริง</label>
              <input
                value={newUser.first_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, first_name: e.target.value })
                }
                placeholder="First Name"
              />
              <label>นามสกุล</label>
              <input
                value={newUser.last_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, last_name: e.target.value })
                }
                placeholder="Last Name"
              />
              <label>อีเมล</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="E-mail"
              />
              <label>แผนก</label>
              <select
                value={newUser.department}
                onChange={(e) =>
                  setNewUser({ ...newUser, department: e.target.value })
                }
              >
                <option value="">-- เลือกแผนก --</option>
                {departments.map((dep) => (
                  <option key={dep.department_id} value={dep.department_name}>
                    {dep.department_name}
                  </option>
                ))}
              </select>
              <label>บทบาท</label>
              <select
                value={newUser.role_id}
                onChange={(e) =>
                  setNewUser({ ...newUser, role_id: parseInt(e.target.value) })
                }
              >
                <option value="">-- เลือกบทบาท --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <button className="perm-save-btn" onClick={handleCreateUser}>
                บันทึก
              </button>
            </div>
          </div>
        </>
      )}

      {showConfirmDelete && (
        <div
          className="perm-modal-overlay"
          onClick={() => setShowConfirmDelete(null)}
        >
          <div className="perm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="perm-modal-header">
              <h3>ยืนยันการลบ</h3>
              <button
                className="perm-modal-close"
                onClick={() => setShowConfirmDelete(null)}
              >
                ×
              </button>
            </div>
            <div className="perm-modal-body">
              คุณต้องการลบผู้ใช้ {showConfirmDelete.employee_id}{" "}
              {showConfirmDelete.first_name} {showConfirmDelete.last_name}{" "}
              ใช่ไหม?
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                }}
              >
                <button
                  className="perm-cancel-btn"
                  onClick={() => setShowConfirmDelete(null)}
                >
                  ยกเลิก
                </button>
                <button
                  className="perm-delete-btn"
                  onClick={() => deleteUser(showConfirmDelete.id)}
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditForm && (
        <div
          className="perm-modal-overlay"
          onClick={() => setShowEditForm(null)}
        >
          <div className="perm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="perm-modal-header">
              <h3>แก้ไขข้อมูลผู้ใช้</h3>
              <button
                className="perm-modal-close"
                onClick={() => setShowEditForm(null)}
              >
                ×
              </button>
            </div>
            <div className="perm-modal-body">
              <label>รหัสพนักงาน</label>
              <input value={editUser.employee_id} disabled readOnly />
              <label>ชื่อผู้ใช้</label>
              <input value={editUser.username} disabled readOnly />
              <label>รหัสผ่านใหม่ (หากต้องการเปลี่ยน)</label>
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
              <label>ชื่อจริง</label>
              <input
                value={editUser.first_name}
                onChange={(e) =>
                  setEditUser({ ...editUser, first_name: e.target.value })
                }
              />
              <label>นามสกุล</label>
              <input
                value={editUser.last_name}
                onChange={(e) =>
                  setEditUser({ ...editUser, last_name: e.target.value })
                }
              />
              <label>อีเมล</label>
              <input
                type="email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
              />
              <label>แผนก</label>
              <select
                value={editUser.department}
                onChange={(e) =>
                  setEditUser({ ...editUser, department: e.target.value })
                }
              >
                <option value="">-- เลือกแผนก --</option>
                {departments.map((dep) => (
                  <option key={dep.department_id} value={dep.department_name}>
                    {dep.department_name}
                  </option>
                ))}
              </select>
              <label>บทบาท</label>
              <select
                value={editUser.role_id}
                onChange={(e) =>
                  setEditUser({
                    ...editUser,
                    role_id: parseInt(e.target.value),
                  })
                }
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <button className="perm-save-btn" onClick={handleEditSubmit}>
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}
      {notification && (
        <div className={`perm-toast ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default PermissionPage;
