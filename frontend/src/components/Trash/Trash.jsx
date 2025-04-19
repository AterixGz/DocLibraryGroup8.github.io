import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Trash.css"; // ถ้าต้องการแยก style เพิ่มได้

const TrashPage = () => {
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData")).token
    : null;

  const fetchTrash = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/files/trash");
      setDeletedFiles(res.data);
    } catch (err) {
      console.error("Error fetching trash files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/files/restore/${id}`);
      setDeletedFiles((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("Error restoring file:", err);
    }
  };

  const handlePermanentDelete = async (id) => {
    const confirm = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบถาวร?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:3000/api/files/permanent-delete/${id}`);
      setDeletedFiles((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("Error permanently deleting file:", err);
    }
  };

  return (
    <div className="trash-container">
      <h1>ถังขยะเอกสาร</h1>
      {loading ? (
        <p>กำลังโหลด...</p>
      ) : deletedFiles.length === 0 ? (
        <p>ไม่มีเอกสารในถังขยะ</p>
      ) : (
        <table className="trash-table">
          <thead>
            <tr>
              <th>ชื่อเอกสาร</th>
              <th>ประเภท</th>
              <th>วันที่ลง</th>
              <th>หน่วยงาน</th>
              <th>วันที่ลบ</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {deletedFiles.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{doc.type}</td>
                <td>{doc.date}</td>
                <td>{doc.department}</td>
                <td>{new Date(doc.deleted_at).toLocaleString("th-TH")}</td>
                <td>
                  <button className="btn-restore" onClick={() => handleRestore(doc.id)}>
                    ♻️ กู้คืน
                  </button>
                  <button className="btn-delete" onClick={() => handlePermanentDelete(doc.id)}>
                    🗑️ ลบถาวร
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TrashPage;
