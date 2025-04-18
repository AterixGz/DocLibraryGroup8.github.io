import SliderComponent from "../SliderComponent/SliderComponent";
import React, { useState, useEffect } from "react";
import "./addFile.css";
import { motion as m } from "framer-motion";

function addFile({ role }) {
    // ใช้ documents ที่ดึงมาจาก API แทน FileData
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
    const [itemsPerPage] = useState(5);
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloadComplete, setIsDownloadComplete] = useState(false);
    const [isSingleDownload, setIsSingleDownload] = useState(false);
    const [downloadPopups, setDownloadPopups] = useState([]);

    // ดึงข้อมูลเอกสารจาก API (เอกสารจะเรียงโดย uploaded_at DESC ใน backend)
    useEffect(() => {
        fetch("http://localhost:3000/api/files")
            .then((response) => response.json())
            .then((data) => setDocuments(data))
            .catch((err) => console.error("Error fetching files:", err));
    }, []);

    const sortDocuments = (docs, option, order) => {
        return docs.sort((a, b) => {
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

    const handleSelectDocument = (id) => {
        setSelectedDocuments((prev) =>
            prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
        );
    };

    const handleSingleDownload = (fileUrl, fileName) => {
        setIsSingleDownload(true);
        const newPopup = {
            id: Date.now(),
            message: `ดาวน์โหลดเอกสารเสร็จสิ้น`,
            isSingle: true,
        };
        setDownloadPopups((prev) => [...prev, newPopup]);
        setTimeout(() => {
            setDownloadPopups((prev) => prev.filter((popup) => popup.id !== newPopup.id));
        }, 5000);
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    };

    // Filtering, Sorting และ Pagination
    const filteredDocuments = documents
        .filter((doc) => {
            const search = searchTerm.trim().toLowerCase();
            const searchTerms = search.split(" ").filter(term => term.length > 0);
            return searchTerms.every((term) => {
                return (
                    doc.name.toLowerCase().includes(term) ||
                    doc.department.toLowerCase().includes(term) ||
                    doc.date.toLowerCase().includes(term) ||
                    doc.type.toLowerCase().includes(term)
                );
            });
        })
        .filter((doc) => {
            return (
                (!filters.documentName || doc.name.toLowerCase().includes(filters.documentName)) &&
                (!filters.date || doc.date === filters.date) &&
                (!filters.category || doc.type.toLowerCase().includes(filters.category.toLowerCase())) &&
                (!filters.department || doc.department.toLowerCase().includes(filters.department.toLowerCase()))
            );
        });

    const sortedDocuments = sortDocuments(filteredDocuments, ...sortOption.split("-"));
    const indexOfLastDocument = currentPage * itemsPerPage;
    const indexOfFirstDocument = indexOfLastDocument - itemsPerPage;
    const currentDocuments = sortedDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
    const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);

    const handleFirstPage = () => setCurrentPage(1);
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handleLastPage = () => setCurrentPage(totalPages);
    const closeDownloadPopup = (id) => {
        setDownloadPopups((prev) => prev.filter((popup) => popup.id !== id));
    };

    return (
        <>
            <SliderComponent />
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className={`home-container ${role === "guest" ? "guest-home" : ""}`} style={{ height: "600px" }}>
                    <div className={`main-content ${role === "guest" ? "guest-main" : ""}`}>
                        <h5 style={{ textAlign: 'center' }}>เอกสารที่เพิ่มล่าสุด</h5>
                        <table className="document-table">
                            <thead>
                                <tr>
                                    {showCheckbox && <th></th>}
                                    <th className="th-num">ลำดับ</th>
                                    <th>ชื่อเอกสาร</th>
                                    <th>ประเภทเอกสาร</th>
                                    <th>วันที่ลง</th>
                                    <th>หน่วยงาน</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentDocuments.map((doc, index) => (
                                    <tr key={doc.id}
                                        className={`row-item ${selectedDocuments.includes(doc.id) ? "row-selected" : ""}`}
                                        onClick={() => handleSelectDocument(doc.id)}>
                                        {showCheckbox && (
                                            <td className="td-addFile">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-round"
                                                    checked={selectedDocuments.includes(doc.id)}
                                                    onChange={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                        )}
                                        <td className="td-addFile">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                        <td className="td-addFile">
                                            {role === "guest" ? (
                                                doc.name
                                            ) : (
                                                <a
                                                    href="#"
                                                    onClick={(e) => { e.stopPropagation(); handlePreview(doc.FileUrl); }}
                                                    className="preview-link"
                                                >
                                                    {doc.name}
                                                </a>
                                            )}
                                        </td>
                                        <td className="td-addFile">{doc.type}</td>
                                        <td className="td-addFile">{doc.date}</td>
                                        <td className="td-addFile">{doc.department}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="page-button">
                            <button className="bp bp-outline-og page-space" onClick={handleFirstPage} disabled={currentPage === 1}>หน้าแรก</button>
                            <button className="bp bp-outline-og page-space" onClick={handlePrevPage} disabled={currentPage === 1}>หน้าก่อนหน้า</button>
                            <span className="page-space">{currentPage} OF {totalPages}</span>
                            <button className="bp bp-outline-og page-space" onClick={handleNextPage} disabled={currentPage === totalPages}>หน้าถัดไป</button>
                            <button className="bp bp-outline-og page-space" onClick={handleLastPage} disabled={currentPage === totalPages}>หน้าสุดท้าย</button>
                        </div>
                        {previewFile && (
                            <div className="preview-modal" onClick={closePreview}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={closePreview} className="close-button">ปิด</button>
                                    <iframe src={previewFile} className="preview-iframe" title="Preview Document"></iframe>
                                </div>
                            </div>
                        )}
                        {alertMessage && (
                            <div className="alert-modal" onClick={closeAlert}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={closeAlert} className="close-button">ปิด</button>
                                    <p>{alertMessage}</p>
                                </div>
                            </div>
                        )}
                        {downloadPopups.map((popup, index) => (
                            <div key={popup.id}
                                className={`download-popup ${popup.hidden ? "hidden" : ""}`}
                                style={{ bottom: `${20 + index * 60}px` }}>
                                <span><i className="bi bi-check-circle"></i></span>&nbsp;
                                <span><b>{popup.message}</b></span>
                                <span onClick={() => closeDownloadPopup(popup.id)} style={{ cursor: "pointer" }}>
                                    &nbsp;<i className="bi bi-x-lg"></i>
                                </span>
                                <div className="progress-bar"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </m.div>
        </>
    );
}

export default addFile;