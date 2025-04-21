import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Document.css";
import image from "../Document/logo1.png";

const Document = () => {
  const [file, setFile] = useState(null);
  const [fileMimeType, setFileMimeType] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [uploadedByName, setUploadedByName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [requiredFields, setRequiredFields] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();
  const bangkokTime = new Date(currentTime.getTime() - (currentTime.getTimezoneOffset() * 60000))
                         .toISOString()
                         .replace('Z', '+07:00');
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      const firstName = userData.first_name || userData.firstName;
      const lastName = userData.last_name || userData.lastName;
      const userId = userData.id;
      setUploadedBy(userId);
      const fullName = `${firstName} ${lastName}`;
      setUploadedByName(fullName);
    } else {
      navigate('/login');
    }
  }, [navigate]);
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      const firstName = userData.first_name || userData.firstName;
      const lastName = userData.last_name || userData.lastName;
      const userId = userData.id;
      setUploadedBy(userId);
      const fullName = `${firstName} ${lastName}`;
      setUploadedByName(fullName);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Effect for real-time clock
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);

  // Effect for notification
  useEffect(() => {
    if (showNotification) {
      const notificationTimer = setTimeout(() => {
        setShowNotification(false);
        setSuccess("");
      }, 5000);
      return () => clearTimeout(notificationTimer);
    }
  }, [showNotification]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileMimeType(selectedFile.type || '');
      setUploadedFileName(selectedFile.name || "");
    }
  };

  const validateForm = () => {
    // ตัดช่องว่างจากค่าที่กรอก
    const trimmedName = name?.trim();
    const trimmedDescription = description?.trim();

    // ตรวจว่าทุกช่องว่างหมดเลย
    if (
      !file &&
      !trimmedName &&
      !type &&
      !department &&
      !trimmedDescription
    ) {
      setError("กรุณากรอกข้อมูลทั้งหมด");
      return false;
    }


    if (!trimmedName) {
      setError("กรุณากรอกชื่อเอกสาร");
      return false;
    }

    if (trimmedName.length < 3) {
      setError("ชื่อเอกสารต้องมีความยาวอย่างน้อย 3 ตัวอักษร");
      return false;
    }

    if (!type) {
      setError("กรุณาเลือกประเภทเอกสาร");
      return false;
    }

    if (!department) {
      setError("กรุณาเลือกแผนก");
      return false;
    }

    if (!trimmedDescription) {
      setError("กรุณากรอกคำอธิบายของเอกสาร");
      return false;
    }
    if (!file) {
      setError("กรุณาเลือกไฟล์ที่ต้องการอัปโหลด");
      return false;
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xlsx', '.xls', '.png', '.jpg', '.jpeg'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setError("ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ที่เป็น PDF, DOC, DOCX, XLS, XLSX, PNG หรือ JPG");
      return false;
    }

    // ทุกอย่างผ่าน
    setError(null);
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xlsx', '.xls', '.png', '.jpg'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setError("ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ที่เป็น PDF, DOC, DOCX, XLS, XLSX, PNG หรือ JPG");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("type", type);
    formData.append("department", department);
    formData.append("date", bangkokTime);
    formData.append("description", description);
    formData.append("uploadedBy", uploadedBy)

    try {
      const response = await fetch("http://localhost:3000/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("เอกสารถูกบันทึกเรียบร้อยแล้ว");
        setShowNotification(true);

        // Reset form
        setFile(null);
        setName("");
        setType("");
        setDescription("");
        setUploadedFileName("");
        setFileMimeType("");
      } else {
        setError("การอัปโหลดล้มเหลว: " + (result.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileMimeType("");
    setUploadedFileName("");
    setShowPreview(false);
  };

  const handlePreviewFile = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="step-tabs-container">
      <div className="tab-content">
        <div>
          <h3>อัพโหลดเอกสาร</h3>
          {error && <div className="error-message">{error}</div>}
          {success && showNotification && (
            <div className="success-notification">
              <div className="notification-content">
                <div className="notification-message">
                  <h4>✓ อัพโหลดสำเร็จ!</h4>
                  <p>{success}</p>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div>
              <label>ชื่อเอกสาร <span className="required">*</span></label>
              <input
                type="text"
                value={name}
                placeholder="กรอกชื่อเอกสาร"
                onChange={(e) => setName(e.target.value)}
                className={requiredFields.name ? "input-error" : ""}
              />
            </div>
            <div>
              <label>ประเภทเอกสาร <span className="required">*</span></label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={requiredFields.type ? "input-error" : ""}>
                <option value="">เลือกประเภท</option>
                <option value="รายงานประจำปี">รายงานประจำปี</option>
                <option value="ผลการดำเนินงาน">ผลการดำเนินงาน</option>
                <option value="รายงานปริมาณการผลิตรายเดือน">รายงานปริมาณการผลิตรายเดือน</option>
                <option value="การขายมูลค่าและค่าภาคหลวง">การขาย มูลค่า และค่าภาคหลวง</option>
                <option value="การจัดสรรค่าภาคหลวงให้ท้องถิ่น">การจัดสรรค่าภาคหลวงให้ท้องถิ่น</option>
                <option value="ปริมาณสำรองปิโตรเลียม">ปริมาณสำรองปิโตรเลียม</option>
              </select>
            </div>
            <div className="form-group-horizontal">
              <div className="form-item">
                <label>แผนก <span className="required">*</span></label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={requiredFields.department ? "input-error" : ""}
                >
                  <option value="">เลือกแผนก</option>
                  <option value="การเงิน">การเงิน</option>
                  <option value="ทรัพยากรบุคคล">ทรัพยากรบุคคล</option>
                  <option value="ไอที">ไอที</option>
                  <option value="การตลาด">การตลาด</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div className="form-item">
                <label>วันที่และเวลา</label>
                <input
                  type="text"
                  value={currentTime.toLocaleString('th-TH', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                  readOnly
                  className="date-display"
                />
              </div>
            </div>
            <div>
              <label>คำอธิบาย <span className="required">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="กรอกคำอธิบายเอกสาร"
                className={requiredFields.description ? "input-error" : ""}
              />
            </div>
            <div>
              <label>อัปโหลดโดย</label>
              <input
                type="text"
                value={uploadedByName}
                readOnly
                className="uploaded-by-display"
              />
            </div>
            <div className="file-upload-container">
              <p>อัปโหลดไฟล์ <span className="required">*</span></p>
              <label htmlFor="file-input" className="custom-file-upload">
                <img src={image} alt="Upload Icon" />
                <p><strong style={{ color: '#4a90e2' }}>Upload File Here</strong></p>
                <p className="file-types">Supports: PDF, DOC, DOCX, XLSX, XLS, PNG, JPG</p>

              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
                className={requiredFields.file ? "input-error" : ""}

              />
            </div>

            {uploadedFileName && (
              <div className="uploaded-file-info">
                <p><strong>ไฟล์ที่เลือก:</strong> {uploadedFileName}</p>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="remove-file-button"
                  style={{ marginRight: 8 }}
                >
                  ลบไฟล์
                </button>
                {(fileMimeType.includes('image') || fileMimeType.includes('pdf')) && (
                  <button
                    type="button"
                    onClick={handlePreviewFile}
                    className="preview-file-button"
                  >
                    Preview
                  </button>
                )}
              </div>
            )}

            {showPreview && file && (
              <div className="preview-popup-overlay" style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div className="preview-popup-content" style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 8,
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  position: 'relative'
                }}>
                  <button
                    onClick={handleClosePreview}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: '#f44336',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      fontSize: 18,
                      cursor: 'pointer'
                    }}
                  >×</button>
                  {fileMimeType.includes('image') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{ maxWidth: '80vw', maxHeight: '80vh' }}
                    />
                  ) : fileMimeType.includes('pdf') ? (
                    <iframe
                      src={URL.createObjectURL(file)}
                      title={file.name}
                      width="800px"
                      height="600px"
                      style={{ maxWidth: '80vw', maxHeight: '80vh' }}
                    ></iframe>
                  ) : (
                    <p>ไม่สามารถแสดงตัวอย่างไฟล์นี้ได้</p>
                  )}
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} className="continue-button">
              {loading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Document;