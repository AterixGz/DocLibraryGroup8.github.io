import React, { useState, useEffect } from "react";
import "./Home.css";
import FileData from "../../data/FileData";
import { motion as m } from "framer-motion";


const Home = ({ role }) => {
    const [documents, setDocuments] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        documentName: "",
        date: "",
        category: "",
        department: "",
    });
    const [sortOption, setSortOption] = useState("date-desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloadComplete, setIsDownloadComplete] = useState(false);
    const [isSingleDownload, setIsSingleDownload] = useState(false); // สำหรับดาวน์โหลดรายตัว




    useEffect(() => {
        setDocuments(FileData);
    }, []);

    const sortDocuments = (documents, option, order) => {
        return documents.sort((a, b) => {
            if (option === "date") {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return order === "asc" ? dateA - dateB : dateB - dateA;
            } else if (option === "name") {
                return order === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (option === "category") {
                return order === "asc"
                    ? a.type.localeCompare(b.type)
                    : b.type.localeCompare(a.type);
            }
            return 0;
        });
    };

    const handleSortChange = (event) => {
        const [option, order] = event.target.value.split("-");
        setSortOption(event.target.value);
        setDocuments((prevDocuments) =>
            sortDocuments([...prevDocuments], option, order)
        );
        setCurrentPage(1); // รีเซ็ตหน้าเป็นหน้าแรก
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // รีเซ็ตหน้าเป็นหน้าแรก
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const cleanedValue = value.trim().toLowerCase().replace(/&/g, "และ");
        setFilters((prevFilters) => ({ ...prevFilters, [name]: cleanedValue }));
        setCurrentPage(1); // รีเซ็ตหน้าเป็นหน้าแรก
    };

    const handlePreview = (fileUrl) => {
        if (fileUrl.endsWith(".xlsx")) {
            setAlertMessage("ไม่สามารถแสดงตัวอย่างไฟล์ Excel ได้ในขณะนี้");
        } else {
            setPreviewFile(fileUrl);
        }
    };

    const closeAlert = () => {
        setAlertMessage(null);
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    const toggleCheckbox = () => {
        setShowCheckbox((prev) => !prev);
        setSelectedDocuments([]); // Reset การเลือกเมื่อ toggle
        setIsDownloading(false); // Reset การดาวน์โหลด
        setIsDownloadComplete(false); // ซ่อน popup
    };

    const handleSelectDocument = (id) => {
        setSelectedDocuments((prev) =>
            prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedDocuments.length === currentDocuments.length) {
            // ยกเลิกการเลือกทั้งหมด
            setSelectedDocuments([]);
        } else {
            // เลือกทั้งหมด
            setSelectedDocuments(currentDocuments.map((doc) => doc.id));
        }
    };

    const handleSingleDownload = (fileUrl, fileName) => {
        setIsSingleDownload(true); // ตั้งค่าให้เป็นการดาวน์โหลดรายตัว
        setIsDownloadComplete(true); // แสดง popup

        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
        link.click();

        // ตั้งเวลาให้ popup หายไปใน 5 วินาที
        setTimeout(() => {
            setIsDownloadComplete(false);
            setIsSingleDownload(false); // รีเซ็ตสถานะ
        }, 5000);
    };




    const handleDownloadSelected = () => {
        setIsSingleDownload(false); // ยืนยันว่าเป็นการดาวน์โหลดหลายไฟล์
        setIsDownloadComplete(true); // แสดง popup

        const filesToDownload = documents.filter((doc) =>
            selectedDocuments.includes(doc.id)
        );

        filesToDownload.forEach((file) => {
            const link = document.createElement("a");
            link.href = file.FileUrl;
            link.download = file.name;
            link.click();
        });

        // ตั้งเวลาให้ popup หายไปใน 5 วินาที
        setTimeout(() => {
            setIsDownloadComplete(false);
        }, 5000);
    };



    const filteredDocuments = documents
        .filter((doc) => {
            const search = searchTerm.trim().toLowerCase();
            return (
                doc.name.toLowerCase().includes(search) ||
                doc.type.toLowerCase().includes(search) ||
                doc.date.toLowerCase().includes(search) ||
                doc.department.toLowerCase().includes(search)
            );
        })
        .filter((doc) => {
            return (
                (!filters.documentName ||
                    doc.name.toLowerCase().includes(filters.documentName)) &&
                (!filters.date || doc.date === filters.date) &&
                (!filters.category ||
                    doc.type.toLowerCase().includes(filters.category.toLowerCase())) &&
                (!filters.department ||
                    doc.department
                        .toLowerCase()
                        .includes(filters.department.toLowerCase()))
            );
        });

    const sortedDocuments = sortDocuments(
        filteredDocuments,
        ...sortOption.split("-")
    );

    const indexOfLastDocument = currentPage * itemsPerPage;
    const indexOfFirstDocument = indexOfLastDocument - itemsPerPage;
    const currentDocuments = sortedDocuments.slice(
        indexOfFirstDocument,
        indexOfLastDocument
    );

    const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleFirstPage = () => {
        setCurrentPage(1);
    };

    const handleLastPage = () => {
        setCurrentPage(totalPages);
    };

    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div className={`home-container ${role === "guest" ? "guest-home" : ""}`}>
                <div className={`main-content ${role === "guest" ? "guest-main" : ""}`}>
                    <h1 className="title-doc">
                        ค้นหาเอกสารทั้งหมด
                        {role === "guest" && (
                            <>
                                <a href="/">
                                    <img src="./img/Logo2.png" alt="Logo" className="logo" />
                                </a>
                                <button
                                    className="back-to-login-btn"
                                    onClick={() => (window.location.href = "/login")}
                                >
                                    กลับไปหน้า Login
                                </button>
                            </>
                        )}
                    </h1>

                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="ค้นหาเอกสาร (ชื่อ, ประเภท, วันที่, หน่วยงาน)"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                    </div>

                    <div className="dropdown">
                        <label className="filter-label">จัดเรียงตาม: </label>
                        <select
                            onChange={handleSortChange}
                            value={sortOption}
                            className="sort-dropdown"
                        >
                            <option value="date-desc">ล่าสุด</option>
                            <option value="date-asc">เก่าที่สุด</option>
                            <option value="name-asc">ชื่อ (ก-ฮ)</option>
                            <option value="name-desc">ชื่อ (ฮ-ก)</option>
                        </select>
                        <label className="filter-labels">ประเภทเอกสาร:</label>
                        <select
                            onChange={handleFilterChange}
                            value={filters.category}
                            name="category"
                            className="sort-dropdown"
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
                        {/* <span className='items-per-page'>
                        <label className='filter-label'>แสดงข้อมูล:</label>
                        <select onChange={(e) => setItemsPerPage(Number(e.target.value))} value={itemsPerPage} className="sort-dropdown">
                            <option value={5}>5 ข้อมูล</option>
                            <option value={10}>10 ข้อมูล</option>
                            <option value={15}>15 ข้อมูล</option>
                            <option value={30}>30 ข้อมูล</option>
                        </select>
                    </span> */}
                    </div>
                    <div className="multi-select-actions">
                        {role !== "guest" && (
                            <th className={`checkbox-th ${isDownloading ? 'no-radius' : ''}`}>
                                <button
                                    onClick={toggleCheckbox}
                                    className="toggle-checkbox-btn"
                                >
                                    {showCheckbox ? "ยกเลิกการเลือก" : "เลือกหลายรายการ"}
                                </button>
                                {showCheckbox && (
                                    <>
                                        <button
                                            onClick={handleSelectAll}
                                            className="toggle-select-all-btn"
                                        >
                                            {selectedDocuments.length === currentDocuments.length
                                                ? "ยกเลิกการเลือกทั้งหมด"
                                                : "เลือกทั้งหมด"}
                                        </button>
                                        <button
                                            onClick={handleDownloadSelected}
                                            disabled={selectedDocuments.length === 0}
                                            className="download-selected-btn"
                                        >
                                            ดาวน์โหลดเอกสารที่เลือก ({selectedDocuments.length})
                                        </button>
                                    </>
                                )}
                            </th>
                        )}
                    </div>
                    <hr className="hr-top"></hr>
                    <table className="document-table">
                        <thead>
                            <tr>
                                {showCheckbox && <th></th>}
                                <th className="th-num">ลำดับ</th>
                                <th>ชื่อเอกสาร</th>
                                <th>ประเภทเอกสาร</th>
                                <th>วันที่ลง</th>
                                <th>หน่วยงาน</th>
                                {role !== "guest" && <th className="th-to">เครื่องมือ</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {currentDocuments.map((doc, index) => (
                                <tr key={doc.id}
                                    className={`row-item ${selectedDocuments.includes(doc.id) ? "row-selected" : ""}`}
                                    onClick={() => handleSelectDocument(doc.id)}>
                                    {showCheckbox && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                className="checkbox-round"
                                                checked={selectedDocuments.includes(doc.id)}
                                                onChange={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                    )}
                                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td>
                                        {role === "guest" ? (
                                            doc.name
                                        ) : (
                                            <a
                                                a href="#" onClick={(e) => { e.stopPropagation(); handlePreview(doc.FileUrl); }} className="preview-link"
                                            >
                                                {doc.name}
                                            </a>
                                        )}
                                    </td>
                                    <td>{doc.type}</td>
                                    <td>{doc.date}</td>
                                    <td>{doc.department}</td>
                                    {role !== "guest" && (
                                        <td>
                                            <a
                                                className="download-link"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // ป้องกันการ trigger การเลือกแถว
                                                    handleSingleDownload(doc.FileUrl, doc.name); // เรียกฟังก์ชัน handleSingleDownload
                                                }}
                                            >
                                                ดาวน์โหลด
                                            </a>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="page-button">
                        <button
                            className="bp bp-outline-og page-space"
                            onClick={handleFirstPage}
                            disabled={currentPage === 1}
                        >
                            หน้าแรก
                        </button>
                        <button
                            className="bp bp-outline-og page-space"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            หน้าก่อนหน้า
                        </button>
                        <span className="page-space">
                            {currentPage} OF {totalPages}
                        </span>
                        <button
                            className="bp bp-outline-og page-space"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            หน้าถัดไป
                        </button>
                        <button
                            className="bp bp-outline-og page-space"
                            onClick={handleLastPage}
                            disabled={currentPage === totalPages}
                        >
                            หน้าสุดท้าย
                        </button>
                    </div>

                    {/* Preview Modal */}
                    {previewFile && (
                        <div className="preview-modal" onClick={closePreview}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <button onClick={closePreview} className="close-button">
                                    ปิด
                                </button>
                                <iframe
                                    src={previewFile}
                                    className="preview-iframe"
                                    title="Preview Document"
                                ></iframe>
                            </div>
                        </div>
                    )}
                    {/* Alert Modal */}
                    {alertMessage && (
                        <div className="alert-modal" onClick={closeAlert}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <button onClick={closeAlert} className="close-button">
                                    ปิด
                                </button>
                                <p>{alertMessage}</p>
                            </div>
                        </div>
                    )}
                    {isDownloadComplete && (
    <div className="download-popup">
        <span>
            <i className="bi bi-check-circle"></i>
        </span>{" "}
        &nbsp;
        {isSingleDownload ? (
            <span><b>ดาวน์โหลดเอกสารเสร็จสิ้น</b></span>
        ) : (
            <span>
                <b>ดาวน์โหลดเอกสารเสร็จสิ้นทั้งหมด{" "}</b>
                <strong>{selectedDocuments.length}</strong> <b>รายการ</b>
            </span>
        )}
        <span
            onClick={() => setIsDownloadComplete(false)}
            style={{ cursor: "pointer" }}
        >
            &nbsp;
            <i className="bi bi-x-lg"></i>
        </span>
        <div className="progress-bar"></div>
    </div>
)}
                </div>
            </div>
        </m.div>
    );
};

export default Home;