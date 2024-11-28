import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import users from "../../data/users";
import "./Permission.css";

function Permission() {
  const [inputValue, setInputValue] = useState("");
  const [namesList, setNamesList] = useState([]);
  const [filteredNamesList, setFilteredNamesList] = useState([]);
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    documentAccess: false,
    permission: false,
    report: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setNamesList(JSON.parse(storedData));
      setFilteredNamesList(JSON.parse(storedData));
    } else {
      const usersList = users.map((user) => ({
        name: user.firstName + " " + user.lastName,
        username: user.username,
        documentAccess: false,
        permission: false,
        report: false,
      }));
      setNamesList(usersList);
      setFilteredNamesList(usersList);
    }
  }, []);

  const handleSearch = (e) => {
    setInputValue(e.target.value);
    const searchTerm = e.target.value.toLowerCase();
    const filtered = namesList.filter(
      (person) =>
        person.name.toLowerCase().includes(searchTerm) ||
        person.username.toLowerCase().includes(searchTerm)
    );
    setFilteredNamesList(filtered);
  };

  const handleShowDetails = (person) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPerson(null);
  };

  const handleDelete = (index) => {
    const updatedNamesList = filteredNamesList.filter((_, i) => i !== index);
    setFilteredNamesList(updatedNamesList);

    const updatedOriginalList = namesList.filter((_, i) => i !== index);
    setNamesList(updatedOriginalList);

    localStorage.setItem("userData", JSON.stringify(updatedNamesList));
  };

  const toggleAccess = (index, field) => {
    const updatedNamesList = [...filteredNamesList];
    updatedNamesList[index][field] = !updatedNamesList[index][field];
    setFilteredNamesList(updatedNamesList);
    setIsDataChanged(true);
    localStorage.setItem("userData", JSON.stringify(updatedNamesList));
  };

  const handleConfirm = () => {
    localStorage.setItem("savedNamesList", JSON.stringify(namesList));
    alert("ข้อมูลทั้งหมดได้รับการยืนยันและบันทึกเรียบร้อย!");
    setIsDataChanged(false);
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

  const handleNavigate = (path) => {
    if (isDataChanged) {
      const confirmLeave = window.confirm(
        "คุณยังไม่ได้บันทึกข้อมูลการเปลี่ยนแปลง! คุณต้องการออกจากหน้านี้?"
      );
      if (confirmLeave) {
        localStorage.setItem("userData", JSON.stringify(filteredNamesList));
        setIsDataChanged(false);
        navigate(path);
      }
    } else {
      navigate(path);
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
        <button className="btn btn-primary add-btn" onClick={handleModalOpen}>
          <i className="bi bi-plus"></i>
        </button>
      </div>

      <div className="names-list">
        <table>
          <thead>
            <tr>
              <th className="align-center">บุคลากร</th>
              <th className="align-center"></th>
              <th className="align-center">การจัดการเอกสาร</th>
              <th className="align-center">การจัดการสิทธิ์เข้าถึง</th>
              <th className="align-center">การจัดการรายงาน</th>
              <th className="align-center"></th>
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
                  <td>
                    <button
                      className="btn btn-link"
                      onClick={() => handleShowDetails(person)}
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                  </td>
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
                      <i className="bi bi-trash"></i>
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
