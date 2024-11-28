import React, { useState, useContext, useEffect } from 'react';
import { FileContext } from '../FileContext/FileContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './Document.css';

const Document = () => {
  const { addFiles } = useContext(FileContext); // Add files function from context
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState(''); // Store date in this state
  const [uploadedBy, setUploadedBy] = useState('');
  const [activeTab, setActiveTab] = useState('Upload');
  const [uploadedFile, setUploadedFile] = useState(null);

  const navigate = useNavigate();
  const steps = ['Upload', 'Preview'];

  // Retrieve user data from localStorage when the component mounts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData')); // Fetch user data from localStorage
    if (userData) {
      setUploadedBy(`${userData.firstName} ${userData.lastName}`); // Set the uploadedBy to the logged-in user's full name
    } else {
      setUploadedBy('Unknown User'); // Default if no user data is found
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDateChange = (e) => {
    const inputDate = new Date(e.target.value);
    if (!isNaN(inputDate)) {
      // Convert the year from Gregorian to Buddhist Era (BE)
      const thaiYear = inputDate.getFullYear() + 543;
      const thaiDate = new Date(inputDate.setFullYear(thaiYear)); // Update the year to BE
      setDate(thaiDate.toISOString().split('T')[0]); // Use ISO format to store in a consistent format
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file || !name || !type || !department || !date || !uploadedBy) {
      alert('All fields are required!');
      return;
    }

    const newFile = {
      id: Date.now(),
      name,
      type,
      department,
      date,
      time: new Date().toLocaleTimeString(),
      FileUrl: URL.createObjectURL(file),
      uploadedBy,
      token: localStorage.getItem('token'), // Get token from localStorage
    };

    setUploadedFile(newFile);
    addFiles(newFile);
    setActiveTab('Preview');
  };

  return (
    <div className="step-tabs-container">
      {/* Tabs */}
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

      {/* Tab Content */}
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
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>ประเภทเอกสาร</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="">เลือกประเภทเอกสาร</option>
                  <option value="ผลการดำเนินงาน">ผลการดำเนินงาน</option>
                  <option value="รายงานประจำปี">รายงานประจำปี</option>
                  <option value="รายงานปริมาณการผลิตรายเดือน">
                    รายงานปริมาณการผลิตรายเดือน
                  </option>
                  <option value="การขาย มูลค่า และค่าภาคหลวง">
                    การขาย มูลค่า และค่าภาคหลวง
                  </option>
                  <option value="การจัดสรรค่าภาคหลวงให้ท้องถิ่น">
                    การจัดสรรค่าภาคหลวงให้ท้องถิ่น
                  </option>
                  <option value="การจัดหาปิโตรเลียม">การจัดหาปิโตรเลียม</option>
                  <option value="ปริมาณสำรองปิโตรเลียม">
                    ปริมาณสำรองปิโตรเลียม
                  </option>
                </select>
              </div>
              <div className="form-item">
                <label>หน่วยงาน</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">เลือกหน่วยงาน</option>
                  <option value="กรมเชื้อเพลิงธรรมชาติ">กรมเชื้อเพลิงธรรมชาติ</option>
                </select>
              </div>

              <div className="form-item">
                <label className="date">วันที่</label>
                <input
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  required
                />
              </div>

              <div>
                <label>ชื่อผู้บันทึก</label>
                <input
                  type="text"
                  value={uploadedBy}
                  readOnly // Disable editing
                />
              </div>
              <div>
                <label>File Upload</label>
                <input type="file" onChange={handleFileChange} required />
              </div>
              <button type="submit" className="continue-button">
                {uploadedFile ? 'Continue to Preview' : 'Upload Document'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'Preview' && (
          <div>
            <h3>ตรวจสอบข้อมูล</h3>
            {uploadedFile ? (
              <div>
                {/* Show uploaded file preview */}
                <div style={{ marginBottom: '1rem' }}>
                  <h4>ตัวอย่างไฟล์:</h4>
                  {uploadedFile.FileUrl && (
                    <div style={{ marginTop: '1rem' }}>
                      {uploadedFile.FileUrl?.type?.startsWith('image/') ? (
                        <img
                          src={uploadedFile.FileUrl}
                          alt={uploadedFile.name}
                          style={{ maxWidth: '100%', maxHeight: '300px' }}
                        />
                      ) : (
                        <iframe
                          src={uploadedFile.FileUrl}
                          title={uploadedFile.name}
                          style={{ width: '100%', height: '500px', border: 'none' }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Show document details */}
                <p><strong>ชื่อเอกสาร:</strong> {uploadedFile.name}</p>
                <p><strong>ประเภทเอกสาร:</strong> {uploadedFile.type}</p>
                <p><strong>หน่วยงาน:</strong> {uploadedFile.department}</p>
                <p>
                  <strong>วันที่:</strong>{' '}
                  {uploadedFile.date} {/* Display date in BE format */}
                </p>
                <p><strong>ผู้บันทึก:</strong> {uploadedFile.uploadedBy}</p>
                <p><strong>เวลาการอัพโหลด:</strong> {uploadedFile.time}</p>
                <button className='continue-button' onClick={() => navigate("/")}>
                  อัพโหลด
                </button>
              </div>
            ) : (
              <p>No document uploaded yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Document;
