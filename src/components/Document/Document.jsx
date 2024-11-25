import React, { useState, useContext } from 'react';
import { FileContext } from '../FileContext/FileContext';

const Document = () => {
    const { addFiles } = useContext(FileContext); // Add files function from context
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [department, setDepartment] = useState('');
    const [year, setYear] = useState('');
    const [date, setDate] = useState('');
    const [uploadedBy, setUploadedBy] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!file || !name || !type || !department || !year || !date || !uploadedBy) {
            alert("All fields are required!");
            return;
        }

        const newFile = {
            id: Date.now(), // You can use any logic to generate unique IDs
            name,
            type,
            department,
            date,
            year,
            time: new Date().toLocaleTimeString(),
            FileUrl: URL.createObjectURL(file),
            uploadedBy,
        };

        addFiles(newFile); // Add file to context
        alert("File uploaded successfully!");

        // Reset form
        setFile(null);
        setName('');
        setType('');
        setDepartment('');
        setYear('');
        setDate('');
        setUploadedBy('');
    };

    return (
        <div>
            <h2>Upload Document</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Document Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Document Type</label>
                    <input type="text" value={type} onChange={(e) => setType(e.target.value)} required />
                </div>
                <div>
                    <label>Department</label>
                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required />
                </div>
                <div>
                    <label>Year</label>
                    <input type="text" value={year} onChange={(e) => setYear(e.target.value)} required />
                </div>
                <div>
                    <label>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div>
                    <label>Uploaded By</label>
                    <input type="text" value={uploadedBy} onChange={(e) => setUploadedBy(e.target.value)} required />
                </div>
                <div>
                    <label>File Upload</label>
                    <input type="file" onChange={handleFileChange} required />
                </div>
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default Document;
