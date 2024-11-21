import "./Permission.css";
import React, { useState, useEffect } from "react";
import users from "../../data/users";

function Permission() {
  const [inputValue, setInputValue] = useState("");
  const [namesList, setNamesList] = useState([]);
  const [filteredNamesList, setFilteredNamesList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    documentAccess: false,
    permission: false,
    report: false,
  });

  useEffect(() => {
    const usersList = users.map((user) => ({
      name: user.firstName + " " + user.lastName,
      username: user.username,
      documentAccess: false,
      permission: false,
      report: false,
    }));
    setNamesList(usersList);
    setFilteredNamesList(usersList);
  }, []);

  const handleSearch = (e) => {
    setInputValue(e.target.value);
    const searchTerm = e.target.value.toLowerCase();
    const filtered = namesList.filter((person) =>
      person.name.toLowerCase().includes(searchTerm) || person.username.toLowerCase().includes(searchTerm)
    );
    setFilteredNamesList(filtered);
  };

  const handleDelete = (index) => {
    const updatedNamesList = filteredNamesList.filter((_, i) => i !== index);
    setFilteredNamesList(updatedNamesList);
  };

  const toggleAccess = (index, field) => {
    const updatedNamesList = [...filteredNamesList];
    updatedNamesList[index][field] = !updatedNamesList[index][field];
    setFilteredNamesList(updatedNamesList);
  };

  const handleConfirm = () => {
    alert("ข้อมูลทั้งหมดได้รับการยืนยัน!");
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewUser({
      firstName: "",
      lastName: "",
      username: "",
      documentAccess: false,
      permission: false,
      report: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = () => {
    if (newUser.firstName && newUser.lastName && newUser.username) {
      const newPerson = {
        name: `${newUser.firstName} ${newUser.lastName}`,
        username: newUser.username,
        documentAccess: newUser.documentAccess,
        permission: newUser.permission,
        report: newUser.report,
      };
      setNamesList((prev) => [...prev, newPerson]);
      setFilteredNamesList((prev) => [...prev, newPerson]);
      handleModalClose();
    } else {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  return (
    <div className="permission-container">
      <h3>จัดการสิทธิ์ในการเข้าถึง</h3>

      <div className="search-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleSearch}
          placeholder="ค้นหาชื่อพนักงานหรือรหัสผู้ใช้งาน"
        />
      </div>

      <button className="add-btn" onClick={handleModalOpen}>
        เพิ่มบุคลากร
      </button>

      <div className="names-list">
        <table>
          <thead>
            <tr>
              <th>บุคลากร</th>
              <th className="align-right">การจัดการเอกสาร</th>
              <th className="align-right">การจัดการสิทธิ์เข้าถึง</th>
              <th className="align-right">การจัดการรายงาน</th>
              <th className="align-right"></th>
            </tr>
          </thead>
          <tbody>
            {filteredNamesList.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              filteredNamesList.map((person, index) => (
                <tr key={index}>
                  <td>{person.name}</td>
                  <td className="align-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={person.documentAccess}
                        onChange={() => toggleAccess(index, "documentAccess")}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td className="align-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={person.permission}
                        onChange={() => toggleAccess(index, "permission")}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td className="align-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={person.report}
                        onChange={() => toggleAccess(index, "report")}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(index)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="confirm-btn-container">
        <button className="confirm-btn" onClick={handleConfirm}>
          ยืนยัน
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>เพิ่มบุคลากรใหม่</h3>
            <input
              type="text"
              name="firstName"
              placeholder="ชื่อ"
              value={newUser.firstName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="นามสกุล"
              value={newUser.lastName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="username"
              placeholder="รหัสผู้ใช้"
              value={newUser.username}
              onChange={handleInputChange}
            />
            <div className="modal-btns">
              <button className="confirm-btn" onClick={handleAddUser}>
                เพิ่ม
              </button>
              <button className="btn-danger" onClick={handleModalClose}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Permission;
//ส่งไฟล์ใหม่