import React, { useState, useContext, useEffect } from "react";
import { FileContext } from "../FileContext/FileContext";
import { useNavigate } from "react-router-dom";
import "./Document.css";

const Document = () => {
  const { addFiles } = useContext(FileContext);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [activeTab, setActiveTab] = useState("Upload");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const steps = ["Upload", "Preview"];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      // ตรวจสอบว่าควรใช้ first_name หรือ firstName ตามโครงสร้างข้อมูลที่บันทึกใน localStorage
      const firstName = userData.first_name || userData.firstName;
      const lastName = userData.last_name || userData.lastName;
      const userId = userData.id;
      
      setUploadedBy(userId); // ส่ง user ID แทนชื่อ
    } else {
      // ถ้าไม่มีข้อมูลผู้ใช้ ให้ redirect ไปหน้า login
      navigate('/login');
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value); // เก็บค่าวันที่ในรูปแบบ YYYY-MM-DD
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!file || !name || !type || !department || !date || !uploadedBy || !description) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
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
    formData.append("uploadedBy", uploadedBy); // ส่ง user ID
  
    try {
      const response = await fetch("http://localhost:3000/api/files/upload", {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();
  
      if (response.ok) {
        const newFile = {
          id: result.id,
          name: result.filename,
          type: result.file_type,
          department: result.department,
          date: result.document_date,
          description: result.description,
          FileUrl: result.url,
          uploadedBy: result.uploaded_by,
        };
  
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
                  <option value="รายงาน">รายงาน</option>
                  <option value="แบบฟอร์ม">แบบฟอร์ม</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div>
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
              <div>
                <label>วันที่</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={handleDateChange} 
                  required 
                />
              </div>
              <div>
                <label>คำอธิบาย</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="กรอกคำอธิบายเอกสาร"
                  required
                />
              </div>
              <div>
                <label>เลือกไฟล์</label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg" 
                  required 
                />
              </div>
              <button type="submit" disabled={loading}>
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
      <p><strong>วันที่:</strong> {uploadedFile?.date}</p>
      <p><strong>คำอธิบาย:</strong> {uploadedFile?.description}</p>
      <p><strong>อัปโหลดโดย:</strong> {uploadedFile?.uploadedBy}</p>
    </div>
    
    {/* แสดงตัวอย่างไฟล์ทุกประเภททันที */}
    <div className="file-preview">
      {uploadedFile?.type?.includes('image') ? (
        <img 
          src={uploadedFile?.url} 
          alt={uploadedFile.name} 
          className="preview-image" 
          style={{ maxWidth: '80%', maxHeight: '400px' }}
        />
      ) : uploadedFile?.type?.includes('pdf') ? (
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
    <div className="file-actions">
      <button 
        onClick={() => navigate('/my-document')} 
        className="done-button"
      >
        เสร็จสิ้น
      </button>
    </div>
  </div>
)}

      </div>
    </div>
  );
};
export default Document;