import React, { useEffect, useState } from "react";
import "./ApprovePage.css";
import { motion as m, AnimatePresence } from "framer-motion";

const ApprovePage = () => {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const fetchPendingFiles = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/files");
      const data = await res.json();
      const filtered = data.filter((f) => f.status === "pending");
      setPendingFiles(filtered);
    } catch (err) {
      console.error("Failed to fetch pending files:", err);
    }
  };

  useEffect(() => {
    fetchPendingFiles();
  }, []);

  const openPopup = (file, type) => {
    setSelectedFile(file);
    setActionType(type);
  };

  const closePopup = () => {
    setSelectedFile(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedFile || !actionType) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/files/approve/${selectedFile.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: actionType }),
        }
      );
      if (res.ok) {
        setToastMessage(
          `เอกสาร "${selectedFile.name}" ได้รับการ$${
            actionType === "approved" ? "อนุมัติ" : "ไม่อนุมัติ"
          }แล้ว`
        );
        setTimeout(() => setToastMessage(null), 3000);
        fetchPendingFiles();
      }
    } catch (err) {
      console.error("Failed to update file status:", err);
    }
    closePopup();
  };

  const handlePreview = (url) => {
    if (!url) {
      alert("ไม่พบ URL สำหรับ preview");
      return;
    }
    if (url.endsWith(".xlsx")) {
      alert("ไม่สามารถแสดงตัวอย่างไฟล์ Excel ได้ในขณะนี้");
      return;
    }
    setPreviewFile(url);
  };

  return (
    <m.div
      className="approve-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="approve-title">เอกสารที่รอการอนุมัติ</h1>

      <table className="approve-table">
        <thead>
          <tr>
            <th>ชื่อเอกสาร</th>
            <th>ประเภท</th>
            <th>วันที่</th>
            <th>หน่วยงาน</th>
            <th>สถานะ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {pendingFiles.map((doc) => (
            <tr key={doc.id} className="approve-row">
              <td>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePreview(doc.fileurl || doc.FileUrl || doc.url);
                  }}
                  className="approve-preview-link"
                >
                  {doc.name}
                </a>
              </td>
              <td>{doc.type}</td>
              <td>{doc.date}</td>
              <td>{doc.department}</td>
              <td>
                <span className="approve-status-tag status-pending">รอการอนุมัติ</span>
              </td>
              <td className="approve-actions">
                <button
                  className="approve-btn-approve"
                  onClick={() => openPopup(doc, "approved")}
                >
                  อนุมัติ
                </button>
                <button
                  className="approve-btn-reject"
                  onClick={() => openPopup(doc, "rejected")}
                >
                  ไม่อนุมัติ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AnimatePresence>
        {selectedFile && (
          <div className="approve-popup-overlay" onClick={closePopup}>
            <m.div
              className="approve-popup-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>
                ยืนยันการ{actionType === "approved" ? "อนุมัติ" : "ไม่อนุมัติ"}
              </h3>
              <p>
                คุณแน่ใจหรือไม่ว่าจะ
                {actionType === "approved" ? "อนุมัติ" : "ไม่อนุมัติ"}เอกสาร: <b>{selectedFile.name}</b>?
              </p>
              <div className="approve-popup-buttons">
                <button className="approve-confirm-btn" onClick={handleConfirmAction}>
                  ยืนยัน
                </button>
                <button className="approve-cancel-btn" onClick={closePopup}>
                  ยกเลิก
                </button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {previewFile && (
        <div className="approve-preview-modal" onClick={() => setPreviewFile(null)}>
          <div className="approve-modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewFile(null)} className="approve-close-button">
              ปิด
            </button>
            <iframe
              src={previewFile}
              className="approve-preview-iframe"
              title="Preview"
            ></iframe>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="approve-toast-message">
          <i className="bi bi-check-circle-fill"></i> {toastMessage}
        </div>
      )}
    </m.div>
  );
};

export default ApprovePage;
