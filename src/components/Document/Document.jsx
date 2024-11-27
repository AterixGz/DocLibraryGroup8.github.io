import React, { useState, useContext } from 'react';
import { FileContext } from '../FileContext/FileContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './Document.css';

const Document = () => {
  const { addFiles } = useContext(FileContext); // Add files function from context
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [activeTab, setActiveTab] = useState('Upload'); // Active tab state
  const [uploadedFile, setUploadedFile] = useState(null); // Store uploaded file details for preview

  const navigate = useNavigate(); // Create navigate function using useNavigate

  const steps = ['Upload', 'Preview'];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file || !name || !type || !department || !year || !date || !uploadedBy) {
      alert('All fields are required!');
      return;
    }

    const newFile = {
      id: Date.now(), // Generate unique ID
      name,
      type,
      department,
      date,
      year,
      time: new Date().toLocaleTimeString(),
      FileUrl: URL.createObjectURL(file),
      uploadedBy,
    };

    setUploadedFile(newFile); // Store file details for preview
    addFiles(newFile); // Add file to context
    // alert('File uploaded successfully!');

    // Automatically switch to Preview tab
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
            <h3>Upload Document</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Document Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Document Type</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Uploaded By</label>
                <input
                  type="text"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  required
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
            <h3>Preview Document</h3>
            {uploadedFile ? (
              <div>
                {/* Show uploaded file preview */}
                <div style={{ marginBottom: '1rem' }}>
                  <h4>File Preview:</h4>
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
                <p><strong>Document Name:</strong> {uploadedFile.name}</p>
                <p><strong>Document Type:</strong> {uploadedFile.type}</p>
                <p><strong>Department:</strong> {uploadedFile.department}</p>
                <p><strong>Year:</strong> {uploadedFile.year}</p>
                <p><strong>Date:</strong> {uploadedFile.date}</p>
                <p><strong>Uploaded By:</strong> {uploadedFile.uploadedBy}</p>
                <p><strong>Uploaded Time:</strong> {uploadedFile.time}</p>
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
