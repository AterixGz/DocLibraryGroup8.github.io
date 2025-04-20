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
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  // แก้ตรงนี้ในฟังก์ชัน upload file



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
    // เพิ่มการเก็บ MIME type
    setFileMimeType(selectedFile?.type || '');
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
    formData.append("uploadedBy", uploadedBy); // ส่ง user ID
    formData.append("mimeType", fileMimeType); // ส่ง MIME type ไปด้วย

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
          mimeType: fileMimeType
        };

        console.log("ข้อมูลไฟล์ที่อัปโหลด:", newFile);
        console.log("URL ของไฟล์:", result.url);

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
                  <label>วันที่</label>
                  <input
                    type="datetime"
                    value={new Date(date).toLocaleDateString('th-TH')}
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
              <div class="file-upload-container">
                <p>อัปโหลดไฟล์</p>
                <label for="file-input" class="custom-file-upload">
                  <img src={image} alt="Upload Icon" />
                  <p><strong>Drag & Drop</strong> <br />or <span class="browse">browse</span></p>
                  <p class="file-types">Supports: PDF, DOC, DOCX, XLSX, XLS, PNG, JPG</p>
                </label>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg"
                  required
                />
              </div>
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
              <p><strong>วันที่:</strong> {new Date(date).toLocaleDateString('th-TH')}</p>
              <p><strong>คำอธิบาย:</strong> {uploadedFile?.description}</p>
              <p><strong>อัปโหลดโดย:</strong> {uploadedByName}</p>
            </div>

            <div className="file-preview">
              {/* ใช้ fileMimeType แทนที่จะใช้ type เพื่อแสดงตัวอย่างไฟล์ได้อย่างถูกต้อง */}
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