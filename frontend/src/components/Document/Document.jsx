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

  const navigate = useNavigate();
  const steps = ["Upload", "Preview"];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setUploadedBy(`${userData.firstName} ${userData.lastName}`);
    } else {
      setUploadedBy("Unknown User");
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleDateChange = (e) => {
    const inputDate = new Date(e.target.value);
    if (!isNaN(inputDate)) {
      const thaiYear = inputDate.getFullYear() + 543;
      const thaiDate = new Date(inputDate.setFullYear(thaiYear));
      setDate(thaiDate.toISOString().split("T")[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !name || !type || !department || !date || !uploadedBy || !description) {
      alert("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("type", type);
    formData.append("department", department);
    formData.append("date", date);
    formData.append("description", description);
    formData.append("uploadedBy", uploadedBy);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        const newFile = {
          id: result.id || Date.now(),
          name,
          type,
          department,
          date,
          description,
          time: new Date().toLocaleTimeString(),
          FileUrl: result.fileUrl || URL.createObjectURL(file),
          uploadedBy,
          token
        };

        setUploadedFile(newFile);
        addFiles(newFile);
        setActiveTab("Preview");
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
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
          >
            {step}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'Upload' && (
          <div>
            <h3>อัพโหลดเอกสาร</h3>
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
                <input
                  type="text"
                  value={department}
                  placeholder="กรอกชื่อแผนก"
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>วันที่</label>
                <input type="date" onChange={handleDateChange} required />
              </div>
              <div>
                <label>คำอธิบาย</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>เลือกไฟล์</label>
                <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg" required />
              </div>
              <button type="submit">อัปโหลด</button>
            </form>
          </div>
        )}

        {activeTab === 'Preview' && uploadedFile && (
          <div>
            <h3>แสดงตัวอย่างเอกสาร</h3>
            <p><strong>ชื่อ:</strong> {uploadedFile.name}</p>
            <p><strong>ประเภท:</strong> {uploadedFile.type}</p>
            <p><strong>แผนก:</strong> {uploadedFile.department}</p>
            <p><strong>วันที่:</strong> {uploadedFile.date}</p>
            <p><strong>คำอธิบาย:</strong> {uploadedFile.description}</p>
            <p><strong>อัปโหลดโดย:</strong> {uploadedFile.uploadedBy}</p>
            <a href={uploadedFile.FileUrl} target="_blank" rel="noopener noreferrer">เปิดไฟล์</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Document;
