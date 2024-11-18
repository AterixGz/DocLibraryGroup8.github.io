import React, { useState, useEffect, useRef } from 'react';
import './Home.css';

const Home = ({ role }) => {
    const [documents, setDocuments] = useState([
        { id: 1, name: "เอกสาร 1", docu: "123456", date: "01-01-2565", year: 2565, category: "หมวดหมู่ A" },
        { id: 2, name: "เอกสาร 2", docu: "789012", date: "15-02-2565", year: 2565, category: "หมวดหมู่ B" },
        { id: 3, name: "เอกสาร 3", docu: "345678", date: "10-03-2565", year: 2565, category: "หมวดหมู่ C" },
        { id: 4, name: "เอกสาร 4", docu: "901234", date: "20-04-2565", year: 2565, category: "หมวดหมู่ D" },
        { id: 5, name: "เอกสาร 5", docu: "567890", date: "05-05-2565", year: 2565, category: "หมวดหมู่ E" },
        { id: 6, name: "เอกสาร 6", docu: "112233", date: "25-06-2565", year: 2565, category: "หมวดหมู่ F" }
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [filters, setFilters] = useState({
        documentNumber: "",
        documentName: "",
        date: "",
        category: "",
        year: "",
        department: "",
        keyword: "",
    });

    const dropdownRef = useRef(null);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    const filteredDocuments = documents.filter(doc => {
        const search = searchTerm.toLowerCase();
        return (
            doc.name.toLowerCase().includes(search) ||
            doc.docu.toLowerCase().includes(search) ||
            doc.date.toLowerCase().includes(search) ||
            doc.year.toString().includes(search) ||
            doc.category.toLowerCase().includes(search)
        );
    }).filter(doc => {
        return (
            (!filters.documentNumber || doc.docu.includes(filters.documentNumber)) &&
            (!filters.documentName || doc.name.toLowerCase().includes(filters.documentName.toLowerCase())) &&
            (!filters.date || doc.date === filters.date) &&
            (!filters.category || doc.category === filters.category) &&
            (!filters.year || doc.year.toString() === filters.year) &&
            (!filters.department || doc.department === filters.department) &&
            (!filters.keyword || doc.name.toLowerCase().includes(filters.keyword.toLowerCase()))
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
                    <button className="sort" onClick={toggleDropdown}>
                        จัดเรียง <span><i className="bi bi-caret-down-fill" style={{ color: "#e66309" }}></i></span>
                    </button>
                </div>

                {isDropdownVisible && (
                    <div className="filter-dropdown" ref={dropdownRef}>
                        <div className="filter-row">
                            <div className="filter-item">
                                <label className="filter-label">เลขเอกสาร</label>
                                <input
                                    className="filter-input"
                                    type="text"
                                    name="documentNumber"
                                    value={filters.documentNumber}
                                    onChange={handleFilterChange}
                                    placeholder="ใส่เลขเอกสาร"
                                />
                            </div>
                            <div className="filter-item">
                                <label className="filter-label">ชื่อเอกสาร</label>
                                <input
                                    className="filter-input"
                                    type="text"
                                    name="documentName"
                                    value={filters.documentName}
                                    onChange={handleFilterChange}
                                    placeholder="ใส่ชื่อเอกสาร"
                                />
                            </div>
                            <div className="filter-item">
                                <label className="filter-label">วันที่</label>
                                <input
                                    className="filter-input"
                                    type="date"
                                    name="date"
                                    value={filters.date}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="filter-item">
                                <label className="filter-label">ประเภทเอกสาร</label>
                                <select
                                    className="filter-select"
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">เลือก</option>
                                    <option value="หมวดหมู่ A">หมวดหมู่ A</option>
                                    <option value="หมวดหมู่ B">หมวดหมู่ B</option>
                                    <option value="หมวดหมู่ C">หมวดหมู่ C</option>
                                    <option value="หมวดหมู่ D">หมวดหมู่ D</option>
                                    <option value="หมวดหมู่ E">หมวดหมู่ E</option>
                                </select>
                            </div>
                        </div>
                        <div className="filter-row">
                            <div className="filter-item">
                                <label className="filter-label">ปีงบประมาณ</label>
                                <select
                                    className="filter-select"
                                    name="year"
                                    value={filters.year}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">เลือก</option>
                                    <option value="2565">2565</option>
                                    <option value="2566">2566</option>
                                    <option value="2567">2567</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label className="filter-label">หน่วยงาน</label>
                                <select
                                    className="filter-select"
                                    name="department"
                                    value={filters.department}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">เลือก</option>
                                    <option value="หน่วยงาน 1">หน่วยงาน 1</option>
                                    <option value="หน่วยงาน 2">หน่วยงาน 2</option>
                                    <option value="หน่วยงาน 3">หน่วยงาน 3</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label className="filter-label">คำเกี่ยวข้อง</label>
                                <input
                                    className="filter-input"
                                    type="text"
                                    name="keyword"
                                    value={filters.keyword}
                                    onChange={handleFilterChange}
                                    placeholder="ใส่คำเกี่ยวข้อง"
                                />
                            </div>
                        </div>
                        <div className="filter-buttons">
                            <button
                                className="search-button"
                                onClick={() => console.log("ค้นหา")}
                            >
                                ค้นหา
                            </button>
                            <button
                                className="reset-button"
                                onClick={() => setFilters({})}
                            >
                                ล้างข้อมูล
                            </button>
                        </div>
                    </div>
                )}

                <div className="fil-buttons-container">
                    <button className="fil-buttons">ประเภทเอกสาร</button>
                    <button className="fil-buttons">ปีงบประมาณ</button>
                    <button className="fil-buttons">หน่วยงาน</button>
                </div>

                <div className="download-buttons">
                    <button className="downloadm">
                        <span><i className="bi bi-check-lg"></i></span>&nbsp;เลือกหลายรายการ
                    </button>
                    <button className="downloadm">
                        <span><i className="fi fi-ss-down-to-line" style={{ color: "#fff" }}></i></span>&nbsp;ดาวน์โหลด
                    </button>
                </div>

                <table className="document-table">
                    <thead>
                        <tr>
                            <th>ลำดับ</th>
                            <th>ชื่อเอกสาร</th>
                            <th>เอกสาร</th>
                            <th>วันที่ลง</th>
                            <th>ปีงบประมาณ</th>
                            <th>หน่วยงาน</th>
                            <th>เครื่องมือ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDocuments.map((doc, index) => (
                            <tr key={doc.id}>
                                <td>{index + 1}</td>
                                <td>{doc.name}</td>
                                <td>{doc.docu}</td>
                                <td>{doc.date}</td>
                                <td>{doc.year}</td>
                                <td>{doc.category}</td>
                                <td>
                                    <button className="view-btn"><i className="bi bi-eye"></i></button>
                                    <button className="download-btn"><i className="bi bi-download"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <button>&laquo; ก่อนหน้า</button>
                    <button>ถัดไป &raquo;</button>
                </div>
            </div>
        </div>
    );
};

export default Home;
