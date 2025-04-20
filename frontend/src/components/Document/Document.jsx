import React, { useState, useContext, useEffect } from "react";
import { FileContext } from "../FileContext/FileContext";
import { useNavigate } from "react-router-dom";
import "./Document.css";
import image from "../Document/logo1.png"; // นำเข้าภาพโลโก้
const Document = () => {
  const { addFiles } = useContext(FileContext);
  const [file, setFile] = useState(null);
  const [fileMimeType, setFileMimeType] = useState(""); // เพิ่ม state สำหรับเก็บ MIME type
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [uploadedByName, setUploadedByName] = useState(""); // เพิ่ม state สำหรับเก็บชื่อผู้อัปโหลด
  const [activeTab, setActiveTab] = useState("Upload");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState(""); // เพิ่ม state สำหรับเก็บชื่อไฟล์ที่อัปโหลด

  const [date, setDate] = useState(() => {
    // สร้างวันที่ปัจจุบันและปรับให้เป็นเวลาไทย (UTC+7)
    const now = new Date();
    const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return thaiTime.toISOString().slice(0, 16);
  });




  const navigate = useNavigate();
  const steps = ["Upload", "Preview"];
  useEffect(() => {
    // ตั้งค่าวันที่และเวลาปัจจุบันครั้งเดียวเมื่อ component โหลด
    setDate(new Date().toISOString().slice(0, 16));
    // ไม่จำเป็นต้องอัพเดททุกวินาที เพราะอาจทำให้เกิดปัญหาเมื่อกรอกข้อมูล
  }, []);
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      // ตรวจสอบว่าควรใช้ first_name หรือ firstName ตามโครงสร้างข้อมูลที่บันทึกใน localStorage
      const firstName = userData.first_name || userData.firstName;
      const lastName = userData.last_name || userData.lastName;
      const userId = userData.id;

      setUploadedBy(userId); // ส่ง user ID แทนชื่อ

      // คำนวณชื่อเต็มและเก็บใน state
      const fullName = `${firstName} ${lastName}`;
      setUploadedByName(fullName);
    } else {
      // ถ้าไม่มีข้อมูลผู้ใช้ ให้ redirect ไปหน้า login
      navigate('/login');
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileMimeType(selectedFile?.type || '');
    setUploadedFileName(selectedFile?.name || ""); // เก็บชื่อไฟล์ที่อัปโหลด
  };




  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file || !name || !type || !department || !date || !uploadedBy || !description) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    // ตรวจสอบประเภทไฟล์
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
    formData.append("date", date);
    formData.append("description", description);
    formData.append("uploadedBy", uploadedBy);
    formData.append("mimeType", fileMimeType);

    try {
      const response = await fetch("http://localhost:3000/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // สร้าง object ที่ตรงกับการใช้งานในโค้ด React
        const newFile = {
          id: result.id,
          name: result.filename || name, // ให้ใช้ filename จาก API หรือ name ที่ส่งไป
          type: result.file_type || type,
          department: result.department || department,
          date: result.document_date || date,
          description: result.description || description,
          FileUrl: result.url || result.FileUrl, // รองรับทั้งสองกรณี
          uploadedBy: result.uploaded_by || uploadedBy,
          mimeType: fileMimeType
        };

        console.log("ข้อมูลไฟล์ที่อัปโหลด:", newFile);

        setUploadedFile(newFile);
        addFiles(newFile);
        setActiveTab("Preview");
      } else {
        setError("การอัปโหลดล้มเหลว: " + result.message);
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
    setUploadedFileName(""); // ลบชื่อไฟล์ที่อัปโหลด
  };
  return (
    <div className="step-tabs-container">
      <div className="tabs">
        {steps.map((step) => (
          <button
            key={step}
            className={`tab-button ${activeTab === step ? 'active' : ''}`}
            onClick={() => setActiveTab(step)}
            disabled={step === 'Preview' && !uploadedFile}
          >
            {step}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'Upload' && (
          <div>
            <h3>อัพโหลดเอกสาร</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div>
                <label>ชื่อเอกสาร</label>
                <input
                  type="text"
                  value={name}
                  placeholder="กรอกชื่อเอกสาร"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>ประเภทเอกสาร</label>
                <select value={type} onChange={(e) => setType(e.target.value)} required>
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
                  <label>แผนก</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
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
                    value={new Date(new Date(date).getTime() + 7 * 60 * 60 * 1000).toLocaleString('th-TH', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                    readOnly
                    className="date-display"
                  />
                </div>
              </div>
              <div>
                <label>คำอธิบาย</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="กรอกคำอธิบายเอกสาร"

                />
              </div>
              <div className="file-upload-container">
                <p>อัปโหลดไฟล์</p>
                <label htmlFor="file-input" className="custom-file-upload">
                  <img src={image} alt="Upload Icon" />
                  <p><strong>Drag & Drop</strong> <br />or <span className="browse">browse</span></p>
                  <p className="file-types">Supports: PDF, DOC, DOCX, XLSX, XLS, PNG, JPG</p>
                </label>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg"
                  required
                />
              </div>
              {/* แสดงชื่อไฟล์ที่อัปโหลดและปุ่มลบ */}
              {uploadedFileName && (
                <div className="uploaded-file-info">
                  <p><strong>ไฟล์ที่เลือก:</strong> {uploadedFileName}</p>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="remove-file-button"
                  >
                    ลบไฟล์
                  </button>
                </div>
              )}
              <button type="submit" disabled={loading} class="continue-button">
                {loading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'Preview' && uploadedFile && (
          <div className="file-preview-container">
            <h3>แสดงตัวอย่างเอกสาร</h3>
            <div className="file-details">
              <p><strong>ชื่อ:</strong> {uploadedFile?.name}</p>
              <p><strong>ประเภท:</strong> {uploadedFile?.type}</p>
              <p><strong>แผนก:</strong> {uploadedFile?.department}</p>
              <p>
                <strong>วันที่:</strong>{" "}
                {uploadedFile?.date
                  ? new Date(new Date(uploadedFile.date).getTime() + 7 * 60 * 60 * 1000).toLocaleString('th-TH', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                  : new Date(new Date(date).getTime() + 7 * 60 * 60 * 1000).toLocaleString('th-TH', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
              </p>
              <p><strong>คำอธิบาย:</strong> {uploadedFile?.description}</p>
              <p><strong>อัปโหลดโดย:</strong> {uploadedByName}</p>
            </div>

            <div className="file-preview">
              {uploadedFile?.mimeType?.includes('image') ? (
                <img
                  src={uploadedFile?.FileUrl}
                  alt={uploadedFile.name}
                  className="preview-image"
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                />
              ) : uploadedFile?.mimeType?.includes('pdf') ? (
                <iframe
                  src={uploadedFile?.FileUrl}
                  title={uploadedFile.name}
                  width="100%"
                  height="500px"
                  className="preview-pdf"
                ></iframe>
              ) : (
                <p>ไม่สามารถแสดงตัวอย่างไฟล์นี้ได้</p>
              )}
            </div>

            <button
              onClick={() => navigate('/my-document')}
              className="continue-button"
            >
              เสร็จสิ้น
            </button>
          </div>
        )}
      </div>
    </div >
  );
};

export default Document;