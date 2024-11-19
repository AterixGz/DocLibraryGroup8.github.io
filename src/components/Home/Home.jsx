import React, { useState, useEffect } from 'react';
import './Home.css';
import FileData from '../../data/FileData';

const Home = ({ role }) => {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        // โหลดข้อมูลจาก FileData.jsx
        setDocuments(FileData);
    }, []);

    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        documentName: "",
        date: "",
        category: "",
        department: "",
    });

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const filteredDocuments = documents.filter(doc => {
        const search = searchTerm.toLowerCase();
        return (
            doc.name.toLowerCase().includes(search) ||
            doc.type.toLowerCase().includes(search) ||
            doc.date.toLowerCase().includes(search) ||
            doc.department.toLowerCase().includes(search)
        );
    }).filter(doc => {
        return (
            (!filters.documentName || doc.name.toLowerCase().includes(filters.documentName.toLowerCase())) &&
            (!filters.date || doc.date === filters.date) &&
            (!filters.category || doc.type === filters.category) &&
            (!filters.department || doc.department === filters.department)
        );
    });

    return (
        <div className={`home-container ${role === "guest" ? "guest-home" : ""}`}>
            <div className={`main-content ${role === "guest" ? "guest-main" : ""}`}>
                <h1 className="title-doc">ค้นหาเอกสารทั้งหมด</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="ค้นหาเอกสาร..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>

                <table className="document-table">
                    <thead>
                        <tr>
                            <th>ลำดับ</th>
                            <th>ชื่อเอกสาร</th>
                            <th>ประเภทเอกสาร</th>
                            <th>วันที่ลง</th>
                            <th>หน่วยงาน</th>
                            <th>เครื่องมือ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDocuments.map((doc, index) => (
                            <tr key={doc.id}>
                                <td>{index + 1}</td>
                                <td>{doc.name}</td>
                                <td>{doc.type}</td>
                                <td>{doc.date}</td>
                                <td>{doc.department}</td>
                                <td>
                                    <a
                                        className="download-link"
                                        href={doc.FileUrl}
                                        download={doc.name}
                                    >
                                        ดาวน์โหลด
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Home;
