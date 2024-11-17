import "./Permission.css";
import React, { useState, useEffect } from "react";
import users from "../../data/users"; // Import users.js

function Permission() {
  const [inputValue, setInputValue] = useState(""); // สำหรับเก็บค่าที่กรอกในช่องค้นหา
  const [namesList, setNamesList] = useState([]); // สำหรับเก็บรายการชื่อบุคลากร
  const [filteredNamesList, setFilteredNamesList] = useState([]); // สำหรับเก็บรายชื่อที่กรองตามชื่อ

  // ฟังก์ชันที่ใช้ในการเพิ่มข้อมูลจาก users.js มาแสดงใน namesList
  useEffect(() => {
    const usersList = users.map((user) => ({
      name: user.firstName + " " + user.lastName,
      username: user.username,
      documentAccess: false, // การเข้าถึงเอกสาร (toggle)
      permission: false, // การจัดการสิทธิ์เข้าถึง (toggle)
      report: false, // การจัดการรายงาน (toggle)
    }));
    setNamesList(usersList);
    setFilteredNamesList(usersList); // กำหนดให้รายชื่อที่แสดงแรกเริ่มเป็นรายชื่อทั้งหมด
  }, []); // ทำงานครั้งเดียวเมื่อคอมโพเนนต์โหลด

  // ฟังก์ชันจัดการการค้นหาชื่อพนักงาน
  const handleSearch = (e) => {
    setInputValue(e.target.value); // อัพเดทค่า input
    const searchTerm = e.target.value.toLowerCase(); // แปลงข้อความที่ค้นหามาเป็น lowercase เพื่อให้ค้นหาได้ไม่แยกตัวพิมพ์ใหญ่/เล็ก
    const filtered = namesList.filter((person) =>
      person.name.toLowerCase().includes(searchTerm) || person.username.toLowerCase().includes(searchTerm)
    );
    setFilteredNamesList(filtered); // อัพเดตรายชื่อที่แสดงผลหลังจากการค้นหา
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

  return (
    <div className="permission-container">
      <h3>จัดการสิทธิ์ในการเข้าถึง</h3>

      {/* ช่องค้นหาชื่อพนักงาน */}
      <div className="search-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleSearch}
          placeholder="ค้นหาชื่อพนักงานหรือรหัสผู้ใช้งาน"
        />
      </div>

      {/* ตารางแสดงรายชื่อบุคลากร */}
      <div className="names-list">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>บุคลากร</th>
              <th style={{ width: '20%' }} className="align-right">การจัดการเอกสาร</th>
              <th style={{ width: '20%' }} className="align-right">การจัดการสิทธิ์เข้าถึง</th>
              <th style={{ width: '20%' }} className="align-right">การจัดการรายงาน</th>
              <th style={{ width: '20%' }} className="align-right"></th>
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
    </div>
  );
}

export default Permission;
