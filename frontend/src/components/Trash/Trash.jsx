import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Trash.css";

const TrashPage = () => {
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const userId = localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData")).id
    : null;

  const fetchTrash = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/files/trash?userId=${userId}`
      );
      setDeletedFiles(res.data);
    } catch (err) {
      setAlertMessage("ไม่สามารถโหลดไฟล์ในถังขยะได้");
      console.error("Error fetching trash files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, [userId]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
  
    return () => clearInterval(timer);
  }, []);
  const handlePreview = (fileUrl) => {
    if (!fileUrl) {
      setAlertMessage("ไม่พบ URL สำหรับ preview");
    } else if (fileUrl.endsWith(".xlsx")) {
      setAlertMessage("ไม่สามารถแสดงตัวอย่างไฟล์ Excel ได้ในขณะนี้");
    } else {
      setPreviewFile(fileUrl);
    }
  };

  const closePreview = () => setPreviewFile(null);
  const closeAlert = () => setAlertMessage(null);
  const closeSuccess = () => setSuccessMessage(null);

  const handleRestore = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/files/restore/${id}`);
      setDeletedFiles((prev) => prev.filter((doc) => doc.id !== id));
      setSuccessMessage("✅ กู้คืนเอกสารเรียบร้อยแล้ว");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setAlertMessage("เกิดข้อผิดพลาดในการกู้คืนไฟล์");
      console.error("Error restoring file:", err);
    }
  };

  const requestConfirmDelete = (id) => setConfirmDeleteId(id);
  const cancelDelete = () => setConfirmDeleteId(null);

  const confirmPermanentDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await axios.delete(
        `http://localhost:3000/api/files/permanent-delete/${confirmDeleteId}`
      );
      setDeletedFiles((prev) =>
        prev.filter((doc) => doc.id !== confirmDeleteId)
      );
      setSuccessMessage("🗑️ ลบถาวรสำเร็จ");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setAlertMessage("เกิดข้อผิดพลาดในการลบไฟล์ถาวร");
      console.error("Error permanently deleting file:", err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="trashpage-container">
      <h1 className="trashpage-title">ถังขยะเอกสาร</h1>
      {loading ? (
        <p>กำลังโหลด...</p>
      ) : deletedFiles.length === 0 ? (
        <p>ไม่มีเอกสารในถังขยะ</p>
      ) : (
        <table className="trashpage-table">
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
                <td>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePreview(doc.fileurl || doc.FileUrl || doc.url);
                    }}
                    className="trashpage-preview-link"
                  >
                    {doc.name}
                  </a>
                </td>
                <td>{doc.type}</td>
                <td>{doc.date}</td>
                <td>{doc.department}</td>
                <td>{new Date(doc.deleted_at).toLocaleString("th-TH")}</td>
                <td>
                  <button
                    className="trashpage-btn-restore"
                    onClick={() => handleRestore(doc.id)}
                  >
                    ♻️ กู้คืน
                  </button>
                  <button
                    className="trashpage-btn-delete"
                    onClick={() => requestConfirmDelete(doc.id)}
                  >
                    🗑️ ลบถาวร
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {previewFile && (
        <div className="trashpage-preview-modal" onClick={closePreview}>
          <div
            className="trashpage-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closePreview} className="trashpage-close-button">
              ปิด
            </button>
            <iframe
              src={previewFile}
              className="trashpage-preview-iframe"
              title="Preview Document"
            ></iframe>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className="trash-popup-overlay" onClick={closeAlert}>
          <div className="trash-popup-box" onClick={(e) => e.stopPropagation()}>
            <p>{alertMessage}</p>
            <button className="trash-popup-close-btn" onClick={closeAlert}>
              ปิด
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="trash-popup-success">
          <div className="trash-popup-success-box">
            <span>
              <i className="bi bi-check-circle-fill"></i>
            </span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="trash-popup-overlay" onClick={cancelDelete}>
          <div className="trash-popup-box" onClick={(e) => e.stopPropagation()}>
            <p>คุณแน่ใจหรือไม่ว่าต้องการลบถาวร?</p>
            <div className="trash-popup-actions">
              <button
                className="trashpage-btn-delete"
                onClick={confirmPermanentDelete}
              >
                ลบถาวร
              </button>
              <button className="trashpage-btn-restore" onClick={cancelDelete}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashPage;
